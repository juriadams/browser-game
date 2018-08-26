// Switching to Canvas-mode if OpenGL is not supported
var type = "WebGL";
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}

// Display PixiJS' hello-message
PIXI.utils.sayHello(type);

// Create the game app and canvas with it
var app = new PIXI.Application({
    width: 1000,
    height: 600
});

// Defining some globally accessible variables
var player1;
var player2;
var goal;
var finishLine;
var countdown;
var title;
var state;
var intro;
var player1Trigger = keyboard(83);
var player2Trigger = keyboard(76);
var startTrigger = keyboard(32);
var difficulty1Trigger = keyboard(49);
var difficulty2Trigger = keyboard(50);
var difficulty3Trigger = keyboard(51);
var toggleMusicTrigger = keyboard(77);
var enemies = [];

// Setting difficulty // TODO: Set in selection screen
var difficulties = [
    {
        id: 1,
        name: 'Easy',
        score: 35
    },
    {
        id: 2,
        name: 'Medium',
        score: 10
    },
    {
        id: 3,
        name: 'Doombot',
        score: 1
    }
];
var difficulty = 1;

// Adding audio
const bgm = PIXI.sound.Sound.from({
    url: 'assets/sounds/background.mp3',
    autoPlay: true,
    complete: function() {
        bgm.play();
    }
});

// Changing audio volume so you don't get blasted away instantly
bgm.volume = 0.5;

const accept = PIXI.sound.Sound.from({
    url: 'assets/sounds/start.mp3',
});

const finish = PIXI.sound.Sound.from({
    url: 'assets/sounds/end.mp3'
});


// Loading all images and then calling the setup() function
PIXI.loader.add([
    'assets/images/minion.png',
    'assets/images/bg.png',
    'assets/images/goal.png',
    'assets/images/enemy1.png',
    'assets/images/enemy2.png',
    'assets/images/enemy3.png'
]).load(setup);

// Setting up main game level
function setup() {

    // Loading in background
    let background = new PIXI.Sprite(PIXI.loader.resources['assets/images/bg.png'].texture);
    // FIXME: Scale down but keep aspect ratio
    background.width = app.screen.width;
    background.height = app.screen.height;
    app.stage.addChild(background);

    // Creating looped background intro video
    // By using a DOM Element as the texture, we're able to enable looping
    // + We can preload the video which fixes some minor display issues
    let introVideo = document.createElement("video");
    introVideo.preload = 'auto';
    introVideo.loop = true;
    introVideo.muted = true;
    introVideo.autoplay = true;
    introVideo.src = 'assets/videos/intro.mp4';

    // Now we're just using the DOM Element as the texture, and voilà, we have a looped video!
    intro = new PIXI.Sprite(PIXI.Texture.fromVideo(introVideo));
    intro.anchor.set(0.5);
    intro.x = app.screen.width / 2;
    intro.y = app.screen.height / 2;
    app.stage.addChild(intro);

    // Loading in invisible finishLine-object for hitDetection
    finishLine = new PIXI.Sprite(PIXI.loader.resources['assets/images/goal.png'].texture);
    finishLine.height = app.screen.height;
    finishLine.x = app.screen.width;
    finishLine.width = 1;
    finishLine.opacity = 0;
    app.stage.addChild(finishLine);

    // Loading in players
    player1 = new PIXI.Sprite(PIXI.loader.resources['assets/images/minion.png'].texture);
    player2 = new PIXI.Sprite(PIXI.loader.resources['assets/images/minion.png'].texture);
    app.stage.addChild(player1);
    app.stage.addChild(player2);

    // Setting up player1
    player1.anchor.set(0.5);
    player1.height = 100;
    player1.width = 100;
    player1.x = 75;
    player1.y = app.screen.height / 2 - app.screen.height / 10;
    player1.vx = 0; // Setting velocity
    player1.vy = 0; // Setting velocity
    player1.visible = false;

    // Setting up player2
    player2.anchor.set(0.5);
    player2.height = 100;
    player2.width = 100;
    player2.x = 75;
    player2.y = app.screen.height / 2 + app.screen.height / 10;
    player2.vx = 0; // Setting velocity
    player2.vy = 0; // Setting velocity
    player2.visible = false;

    // Loading in visible 'finish line', aka the pot
    goal = new PIXI.Sprite(PIXI.loader.resources['assets/images/goal.png'].texture);
    goal.anchor.set(0.5);
    goal.x = app.screen.width - goal.width / 2;
    goal.y = app.screen.height / 2;
    goal.visible = false;
    app.stage.addChild(goal);

    // Welcome message text
    title = new PIXI.Text('Welcome to Minion Rush!', style);
    title.anchor.set(0.5);
    title.x = app.screen.width / 2;
    title.y = app.screen.height / 2 - 25;
    app.stage.addChild(title);

    // Game start countdown text
    countdown = new PIXI.Text('3', counterStyle);
    countdown.anchor.set(0.5);
    countdown.x = app.screen.width / 2;
    countdown.y = app.screen.height / 2;
    countdown.visible = false;
    app.stage.addChild(countdown);

    // Hint text
    hint = new PIXI.Text('Press SPACEBAR to start the game!', hintStyle);
    hint.anchor.set(0.5);
    hint.x = app.screen.width / 2;
    hint.y = app.screen.height / 2 + 20;
    app.stage.addChild(hint);

    // Current Difficulty
    difficultyStatus = new PIXI.Text('Current Difficulty: ' + difficulties[difficulty - 1].name, hintStyle);
    difficultyStatus.anchor.set(0.5);
    difficultyStatus.x = app.screen.width / 2;
    difficultyStatus.y = app.screen.height - 60;
    app.stage.addChild(difficultyStatus);

    // Setting game state to pause
    state = pause;

    // Launching the gameLoop() function (calling 60 times per second)
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta){
    // Update the current game state
    state(delta);
}

// Defining these variables outside of the play function
// Otherwise they'll just be reset over and over again and won't work
var player1Down = true;
var player2Down = true;

function play(delta) {
    // Showing players and goal
    player1.visible = true;
    player2.visible = true;
    goal.visible = true;

    // Player movement and animation
    player1Trigger.press = () => {
        if (state === play) {
            // Very simple if-statement
            // Every click the player moves a bit up and a bit down
            if(player1Down) {
                player1.rotation += 0.1;
            } else {
                player1.rotation -= 0.1;
            }
            player1Down = !player1Down;
            // - 1 because arrays start at 0 ;)
            player1.x += difficulties[difficulty - 1].score;
        }
    };

    player2Trigger.press = () => {
        if (state === play) {
            // Same if-statement as above, this time for player2
            if(player2Down) {
                player2.rotation += 0.1;
            } else {
                player2.rotation -= 0.1;
            }
            player2Down = !player2Down;
            // - 1 because arrays start at 0 ;)
            player2.x += difficulties[difficulty - 1].score;
        }
    };

    // Checking if player2 hit the finishLine
    if (hitTestRectangle(player1, finishLine)) {
        state = postGame;
        finish.play();
        gameOver('Player 1');
    }

    // Checking if player2 hit the finishLine
    if (hitTestRectangle(player2, finishLine)) {
        finish.play();
        state = postGame;
        gameOver('Player 2');
    }

    // Animating enemies flying around in background
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].rotation += 0.005 * delta;
        enemies[i].children[0].rotation += 0.01 * delta;
    }

    // Fallback if preGame() doesn't fade out the video properly
    // if statement in order to prevent memory leaks
    if (intro.alpha > 0) {
        intro.alpha -= 0.01;
    }
}

// This function is being called during the countdown
function preGame(delta) {
    // Fading out intro video
    intro.alpha -= 0.01;

    // Fading in enemies
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].rotation += 0.005 * delta;
        enemies[i].children[0].rotation += 0.01 * delta;
        enemies[i].alpha = 0.25;
    }
}

// This function is being called after a game is finished
function postGame(delta) {
    // Fading in intro video
    intro.alpha += 0.01;

    // Fading out enemies
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].rotation += 0.005 * delta;
        enemies[i].children[0].rotation += 0.01 * delta;
        enemies[i].alpha -= 0.1;
    }
}

// This function is an idle state before any action is done
// (Basically the title screen, waiting for the user to press SPACEBAR)
function pause(delta) {
}

// Countdown function, switching game state after 3 seconds
function startGame() {
    state = preGame;
    title.visible = false;
    hint.visible = false;
    countdown.visible = true;
    countdown.text = '3...';
    setTimeout(() => {
        countdown.text = '2...';
    }, 1000);
    setTimeout(() => {
        countdown.text = '1...';
    }, 2000);
    setTimeout(() => {
        spawnEnemies();
        countdown.text = 'GO!';
        state = play;
    }, 3000);
    setTimeout(() => {
        countdown.visible = false;
    }, 4000);
}

// Called when a player reached the finishLine
function gameOver(player) {
    title.text = player + ' won!';
    title.visible = true;
    hint.visible = true;
    player1.visible = false;
    player2.visible = false;
    goal.visible = false;
    player1.x = 75;
    player2.x = 75;
}

// Called once to spawn enemies flying around in the background
function spawnEnemies() {
    if (!enemies.length > 0) {
        for (var i = 0; i < 5; i++) {
            enemies[i] = new PIXI.Container();
            enemies[i].position.set(app.screen.width/2, app.screen.height/2);
            enemies[i].rotation = (i / 5) * (Math.PI * 2);
            enemies[i].pivot.set(0, -300);

            let enemySprites = [
                'assets/images/enemy1.png',
                'assets/images/enemy2.png',
                'assets/images/enemy3.png'
            ];
            let enemySprite = new PIXI.Sprite(PIXI.loader.resources[enemySprites[Math.floor(Math.random() * enemySprites.length)]].texture);
            enemies[i].addChild(enemySprite);
            enemySprite.anchor.set(0.5);
            enemySprite.scale.set(0.5 + Math.random());
            enemySprite.alpha = 0.25;

            app.stage.addChild(enemies[i]);
        }
    }
}

// Listening for keyboard inputs
difficulty1Trigger.press = () => {
    if (state === pause || state === postGame) {
        difficulty = 1;
        difficultyStatus.text = 'Current Difficulty: ' + difficulties[difficulty - 1].name;
    }
};

difficulty2Trigger.press = () => {
    if (state === pause || state === postGame) {
        difficulty = 2;
        difficultyStatus.text = 'Current Difficulty: ' + difficulties[difficulty - 1].name;
    }
};

difficulty3Trigger.press = () => {
    if (state === pause || state === postGame) {
        difficulty = 3;
        difficultyStatus.text = 'Current Difficulty: ' + difficulties[difficulty - 1].name;
    }
};

startTrigger.press = () => {
    if (state === pause || state === postGame) {
        state = preGame;
        accept.play();
        startGame();
    }
};

toggleMusicTrigger.press = () => {
    if (bgm.volume > 0) {
        bgm.volume = 0;
    } else if (bgm.volume === 0) {
        bgm.volume = 0.5;
    }

};

// Add the generated canvas to the screen
document.body.appendChild(app.view);