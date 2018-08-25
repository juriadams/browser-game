function keyboard(keyCode) {
    let key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = event => {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };

    //The `upHandler`
    key.upHandler = event => {
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };

    //Attach event listeners
    window.addEventListener(
        "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
        "keyup", key.upHandler.bind(key), false
    );
    return key;
}

function hitTestRectangle(r1, r2) {

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //hit will determine whether there's a collision
    hit = false;

    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;

    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {

        //A collision might be occuring. Check for a collision on the y axis
        hit = Math.abs(vy) < combinedHalfHeights;
    } else {

        //There's no collision on the x axis
        hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;
}

var type = "WebGL";
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}

PIXI.utils.sayHello(type);

// Create the application
// TODO: Make size of browser window
var app = new PIXI.Application({
    width: 1000,
    height: 600,
    antialias: true
});

var player1, player2, goal, state;

var difficulty = 5;

// Setting game background-color, TODO: replace with background image
app.renderer.backgroundColor = 0x061639;

// Loading all images and then calling setup() function
PIXI.loader.add(['assets/images/minion.png', 'assets/images/bg.png', 'assets/images/player3.png', 'assets/images/goal.png']).load(setup);

// Adding the players to the stage
function setup() {

    // Loading in background
    let background = new PIXI.Sprite(PIXI.loader.resources['assets/images/bg.png'].texture);
    background.width = app.screen.width;
    background.height = app.screen.height;
    app.stage.addChild(background);

    goal = new PIXI.Sprite(PIXI.loader.resources['assets/images/goal.png'].texture);
    goal.anchor.set(0.5);
    goal.x = app.screen.width - goal.width / 2;
    goal.y = app.screen.height / 2;
    app.stage.addChild(goal);

    // Loading and adding player textures to canvas
    player1 = new PIXI.Sprite(PIXI.loader.resources['assets/images/minion.png'].texture);
    player2 = new PIXI.Sprite(PIXI.loader.resources['assets/images/minion.png'].texture);
    app.stage.addChild(player1);
    app.stage.addChild(player2);

    // Setting up player1
    player1.anchor.set(0.5);
    player1.height = 100;
    player1.width = 100;
    player1.x = 50;
    player1.y = app.screen.height / 2 - app.screen.height / 10;
    player1.vx = 0; // Setting velocity
    player1.vy = 0; // Setting velocity

    // Setting up player2
    player2.anchor.set(0.5);
    player2.height = 100;
    player2.width = 100;
    player2.x = 50;
    player2.y = app.screen.height / 2 + app.screen.height / 10;
    player2.vx = 0; // Setting velocity
    player2.vy = 0; // Setting velocity

    // Setting game state to play
    state = pause;

    // Launching the gameLoop() function (calling 60 times per second)
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta){

    // Update the current game state
    state(delta);
}

function play(delta) {
    if (hitTestRectangle(player1, goal)) {
        console.log('Player 1 won!');
        state = end;
    }
    if (hitTestRectangle(player2, goal)) {
        console.log('Player 2 won!');
        state = end;
    }
}

function pause(delta) {
    player1.vx = 0;
    player2.vx = 0;
}

function startGame() {
    // Make characters start move
    state = play;
}

function pauseGame() {
    // Stop characters from moving
    state = pause;
}

function resetGame() {
    // Stop characters from moving and resetting them to their start position
    state = pause;

    // Resetting the players' positions and rotations
    player1.x = 50;
    player1.rotation = 0;
    player2.x = 50;
    player2.rotation = 0;
}

var player1Trigger = keyboard(83);
var player2Trigger = keyboard(76);
var resetTrigger = keyboard(82);

resetTrigger.press = () => {
  resetGame();
};

var player1Down = true;
player1Trigger.press = () => {
    if(player1Down) {
        player1.rotation += 0.1;
    } else {
        player1.rotation -= 0.1;
    }
    player1Down = !player1Down;
    player1.x += difficulty;
};

var player2Down = true;
player2Trigger.press = () => {
    if(player2Down) {
        player2.rotation += 0.1;
    } else {
        player2.rotation -= 0.1;
    }
    player2Down = !player2Down;
    player2.x += difficulty;
};


// Add the generated canvas to the screen
document.body.appendChild(app.view);