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

var type = "WebGL";
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}

PIXI.utils.sayHello(type);

// Create the application
// TODO: Make size of browser window
var app = new PIXI.Application({
    width: 800,
    height: 600,
    antialias: true
});

var player1, player2, state;

var difficulty = 5;

// Setting game background-color, TODO: replace with background image
app.renderer.backgroundColor = 0x061639;

// Loading all images and then calling setup() function
PIXI.loader.add(['assets/images/minion.png']).load(setup);

// Adding the players to the stage
function setup() {

    // Loading and adding player textures to canvas
    player1 = new PIXI.Sprite(PIXI.loader.resources['assets/images/minion.png'].texture);
    player2 = new PIXI.Sprite(PIXI.loader.resources['assets/images/minion.png'].texture);
    app.stage.addChild(player1);
    app.stage.addChild(player2);

    // Setting up player1
    player1.anchor.set(0.5);
    player1.height = app.screen.height / 10;
    player1.width = app.screen.height / 10;
    player1.x = 100;
    player1.y = app.screen.height / 2 - app.screen.height / 10;
    player1.vx = 0; // Setting velocity
    player1.vy = 0; // Setting velocity

    // Setting up player2
    player2.anchor.set(0.5);
    player2.height = app.screen.height / 10;
    player2.width = app.screen.height / 10;
    player2.x = 100;
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
    // TODO: Sync velocity with IPS (input per second)
    // player1.vx = 1;
    // player1.x += player1.vx;

    // player2.vx = 2;
    // player2.x += player2.vx;
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
    player1.x = 100;
    player1.rotation = 0;
    player2.x = 100;
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