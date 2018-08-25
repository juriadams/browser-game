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
var player1, player2, goal, finishLine, title, countdown, state;
var player1Trigger = keyboard(83);
var player2Trigger = keyboard(76);

// Setting difficulty // TODO: Set in selection screen
var difficulty = 5;

// Loading all images and then calling setup() function
PIXI.loader.add(['assets/images/minion.png', 'assets/images/bg.png', 'assets/images/player3.png', 'assets/images/goal.png']).load(setup);

// Setting up main game level
function setup() {

    // Loading in background
    let background = new PIXI.Sprite(PIXI.loader.resources['assets/images/bg.png'].texture);
    background.width = app.screen.width;
    background.height = app.screen.height;
    app.stage.addChild(background);

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
    player1.x = 875;
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

    let style = new PIXI.TextStyle({
        align: 'center',
        fontFamily: "Stroud",
        fontSize: 56,
        fill: "white",
        dropShadow: true,
        dropShadowColor: "#000000",
        dropShadowBlur: 4,
        dropShadowAngle: 1,
        dropShadowDistance: 6
    });

    let counterStyle = new PIXI.TextStyle({
        align: 'center',
        fontFamily: "Stroud",
        fontSize: 156,
        fill: "white",
        dropShadow: true,
        dropShadowColor: "#000000",
        dropShadowBlur: 4,
        dropShadowAngle: 1,
        dropShadowDistance: 6
    });

    let hintStyle = new PIXI.TextStyle({
        align: 'center',
        fontFamily: "Stroud",
        fontSize: 36,
        fill: "white",
        dropShadow: true,
        dropShadowColor: "#000000",
        dropShadowBlur: 4,
        dropShadowAngle: 1,
        dropShadowDistance: 6
    });

    title = new PIXI.Text('Welcome to Minion Rush!', style);
    title.anchor.set(0.5);
    title.x = app.screen.width / 2;
    title.y = 100;
    app.stage.addChild(title);

    countdown = new PIXI.Text('3', counterStyle);
    countdown.anchor.set(0.5);
    countdown.x = app.screen.width / 2;
    countdown.y = app.screen.height / 2;
    countdown.visible = false;
    app.stage.addChild(countdown);

    hint = new PIXI.Text('Press SPACEBAR to start the game!', hintStyle);
    hint.anchor.set(0.5);
    hint.x = app.screen.width / 2;
    hint.y = app.screen.height / 2;
    app.stage.addChild(hint);

    // Setting game state to pause
    state = pause;
    console.log(state);

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
        if(player1Down) {
            player1.rotation += 0.1;
        } else {
            player1.rotation -= 0.1;
        }
        player1Down = !player1Down;
        player1.x += difficulty;
    };

    player2Trigger.press = () => {
        if(player2Down) {
            player2.rotation += 0.1;
        } else {
            player2.rotation -= 0.1;
        }
        player2Down = !player2Down;
        player2.x += difficulty;
    };

    // Finish check
    if (hitTestRectangle(player1, finishLine)) {
        console.log('Player 1 won!');
        gameOver('Player 1');
    }
    if (hitTestRectangle(player2, finishLine)) {
        console.log('Player 2 won!');
        gameOver('Player 2');
    }
}

function pause(delta) {
    let startTrigger = keyboard(32);
    startTrigger.press = () => {
        if (state === pause) {
            startGame();
        }
    };
}

function startGame() {
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
        countdown.text = 'GO!';
        state = play;
    }, 3000);
    setTimeout(() => {
        countdown.visible = false;
    }, 4000);
}

function gameOver(player) {
    state = pause;
    title.text = player + ' won!';
    title.visible = true;
    hint.visible = true;
    player1.visible = false;
    player2.visible = false;
    goal.visible = false;
    player1.x = 75;
    player2.x = 75;
}

// Add the generated canvas to the screen
document.body.appendChild(app.view);