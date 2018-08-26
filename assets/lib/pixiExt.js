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

// Defining some text styles
const style = new PIXI.TextStyle({
    align: 'center',
    fontFamily: "Stroud",
    fontSize: 56,
    fill: "white",
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 10,
    dropShadowAngle: 1.5,
    dropShadowDistance: 4
});

const counterStyle = new PIXI.TextStyle({
    align: 'center',
    fontFamily: "Stroud",
    fontSize: 156,
    fill: "white",
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 10,
    dropShadowAngle: 1.5,
    dropShadowDistance: 4
});

const hintStyle = new PIXI.TextStyle({
    align: 'center',
    fontFamily: "Stroud",
    fontSize: 36,
    fill: "white",
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 10,
    dropShadowAngle: 1.5,
    dropShadowDistance: 4
});