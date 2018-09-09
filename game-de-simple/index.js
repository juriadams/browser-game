// Wechseln zu Canvas-Rendering falls Browser kein WebGL unterstützt
var type = "WebGL";
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}

// Nachricht in der Konsole anzeigen wenn Pixi erfolgreich geladen wurde
PIXI.utils.sayHello(type);

// Das Spielfeld definieren
var app = new PIXI.Application({
    width: 1000,
    height: 600
});

// Global verfügbare Variabeln definieren
var player1;
var player2;
var goal;
var finishLine;
var countdown;
var title;
var state;
var player1Button = keyboard(83);
var player2Button = keyboard(76);
var startButton = keyboard(32);

// Benötigte Bilder am einmal am Anfang des Skripts laden
PIXI.loader.add([
    'assets/images/minion.png',
    'assets/images/bg.png',
    'assets/images/goal.png',
    'assets/images/enemy1.png',
    'assets/images/enemy2.png',
    'assets/images/enemy3.png'
]).load(setup);

// Aufsetzen des Spielfelds
function setup() {

    // Hintergrund (Bild) laden
    let background = new PIXI.Sprite(PIXI.loader.resources['assets/images/bg.png'].texture);
    // Breite und Höhe des Bilds setzen
    background.width = app.screen.width;
    background.height = app.screen.height;
    // Bild dem Level hinzufügen
    app.stage.addChild(background);

    // (Unsichtbare) Ziellinie laden
    finishLine = new PIXI.Sprite(PIXI.loader.resources['assets/images/goal.png'].texture);
    // Breite und Höhe der Ziellinie setzen
    finishLine.width = 1;
    finishLine.height = app.screen.height;
    // X-Koordinate setzen
    finishLine.x = app.screen.width;
    // Ziellinie unsichtbar machen
    finishLine.opacity = 0;
    // Ziellinie dem Level hinzufügen
    app.stage.addChild(finishLine);

    // Gleicher Prozess für die Spieler:
    // Texturen der Spielfiguren laden
    player1 = new PIXI.Sprite(PIXI.loader.resources['assets/images/minion.png'].texture);
    player2 = new PIXI.Sprite(PIXI.loader.resources['assets/images/minion.png'].texture);
    // Spielfiguren dem Level hinzufügen
    app.stage.addChild(player1);
    app.stage.addChild(player2);

    // Ankerpunkt von Spieler 1 in die Mitte setzen
    player1.anchor.set(0.5);
    // Breite und Höhe setzen
    player1.height = 100;
    player1.width = 100;
    // Spielfigur auf Startposition setzen
    player1.x = 75;
    player1.y = app.screen.height / 2 - app.screen.height / 10;
    // Spielfigur soll im Titelbildschirm unsichtbar sein
    player1.visible = false;

    // Ankerpunkt von Spieler 1 in die Mitte setzen
    player2.anchor.set(0.5);
    // Breite und Höhe setzen
    player2.height = 100;
    player2.width = 100;
    // Spielfigur auf Startposition setzen
    player2.x = 75;
    player2.y = app.screen.height / 2 + app.screen.height / 10;
    // Spielfigur soll im Titelbildschirm unsichtbar sein
    player2.visible = false;

    // Sichtbare "Ziellinie" laden (Der Topf am rechten Bildschirmrand)
    goal = new PIXI.Sprite(PIXI.loader.resources['assets/images/goal.png'].texture);
    // Ankerpunkt von Spieler 1 in die Mitte setzen
    goal.anchor.set(0.5);
    // Breite und Höhe setzen
    goal.x = app.screen.width - goal.width / 2;
    goal.y = app.screen.height / 2;
    // Ziellinie soll im Titelbildschirm unsichtbar sein
    goal.visible = false;
    // Ziellinie dem Level hinzufügen
    app.stage.addChild(goal);

    // Titeltext definieren
    title = new PIXI.Text('Welcome to Minion Rush!', style);
    // Ankerpunkt von Titeltext in die Mitte setzen
    title.anchor.set(0.5);
    // X- und Y-Koordinaten setzen
    title.x = app.screen.width / 2;
    title.y = app.screen.height / 2 - 25;
    // Titeltext dem Level hinzufügen
    app.stage.addChild(title);

    // Countdowntext hinzufügen
    countdown = new PIXI.Text('3', counterStyle);
    // Ankerpunkt von Countdowntext in die Mitte setzen
    countdown.anchor.set(0.5);
    // X- und Y- Koordinaten setzen (Komplett Zentriert)
    countdown.x = app.screen.width / 2;
    countdown.y = app.screen.height / 2;
    // Countdowntext soll am Anfang noch unsichtbar sein
    countdown.visible = false;
    // Countdowntext dem Level hinzufügen
    app.stage.addChild(countdown);

    // "Hint"-text definieren
    hint = new PIXI.Text('Press SPACEBAR to start the game!', hintStyle);
    // Ankerpunkt des Textes in die Mitte setzen
    hint.anchor.set(0.5);
    // X- und Y-Koordinaten des Textes setzen
    hint.x = app.screen.width / 2;
    hint.y = app.screen.height / 2 + 20;
    // Text dem Level hinzufügen
    app.stage.addChild(hint);

    // Spielstatus auf "Pause" setzen
    state = pause;

    // "gameLoop"-Funktion erstellen welche 60 mal pro Sekunde den Status des spiels
    // und die Positionen der Spieler überprüft.
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta){
    // Funktion mitteilen, dass sie 60 mal pro Sekunde den Spielstatus überprüfen soll
    state(delta);
}

function play() {
    // Spielfiguren und Ziellinie einblenden
    player1.visible = true;
    player2.visible = true;
    goal.visible = true;

    // Eventlistener für "player1Button" (S)
    player1Button.press = () => {
        // Wenn Taste gedrückt wurde und der Countdown abgelaufen ist die Spielfigur bewegen
        if (state === play) {
            player1.x += 25;
        }
    };

    // Eventlistener für "player2Button" (L)
    player2Button.press = () => {
        // Wenn Taste gedrückt wurde und der Countdown abgelaufen ist die Spielfigur bewegen
        if (state === play) {
            player2.x += 25;
        }
    };

    // Überprüfen ob Spieler 1 die Ziellinie erreicht hat
    if (hitTestRectangle(player1, finishLine)) {
        // Wenn ja, dann Status auf "postGame" setzen
        state = postGame;
        // und anschließen die Runde beenden
        gameOver('Player 1');
    }

    // Überprüfen ob Spieler 2 die Ziellinie erreicht hat
    if (hitTestRectangle(player2, finishLine)) {
        // Wenn ja, dann Status auf "postGame" setzen
        state = postGame;
        // und anschließen die Runde beenden
        gameOver('Player 2');
    }
}

// "preGame"-Spielstatus definieren (Aktiv währen der Countdown läuft)
function preGame(delta) {
}

// "postGame"-Spielstatus definieren (Aktiv nachdem ein Spieler die Ziellinie erreicht hat)
function postGame(delta) {
}

// "pause"-Spielstatus definieren (Aktiv bevor eine Runde gestartet wurde, aka. "Titelbildschirm")
function pause(delta) {
}

// "startGame"-Funktion, wird ausgeführt wenn die Leertaste betätigt wird
function startGame() {
    // Spielstatus auf "preGame" setzen
    state = preGame;
    // Titel und Hint ausblenden
    title.visible = false;
    hint.visible = false;
    // Countdown einblenden
    countdown.visible = true;
    // Countdown-Text auf "3..." setzen
    countdown.text = '3...';
    setTimeout(() => {
        // Countdown-Text nach einer Sekunde auf "2..." setzen
        countdown.text = '2...';
    }, 1000);
    setTimeout(() => {
        // Countdown-Text nach zwei Sekunden auf "1..." setzen
        countdown.text = '1...';
    }, 2000);
    setTimeout(() => {
        // Countdown-Text nach drei Sekunden auf "GO!" setzen
        countdown.text = 'GO!';
        // Spielstatus auf "play" setzten nachdem der Countdown abgelaufen ist
        state = play;
    }, 3000);
    setTimeout(() => {
        // Nach vier Sekunden den Countdown-Text wieder ausblenden
        countdown.visible = false;
    }, 4000);
}

// "gameOver"-Funktion, wird ausgeführt wenn ein Spieler die Ziellinie überschritten hat
function gameOver(player) {
    // Titel-Text auf "Player 1/Player 2 won!" setzen
    title.text = player + ' won!';
    // Titel und Hint wieder einblenden
    title.visible = true;
    hint.visible = true;
    // Spielfiguren und Ziellinie ausblenden
    player1.visible = false;
    player2.visible = false;
    goal.visible = false;
    // Spielfiguren wieder auf ihre Anfangsposition setzen
    player1.x = 75;
    player2.x = 75;
}

// Eventlistener für "startButton" (Leertaste)
startButton.press = () => {
    // Wenn der Spielstatus "pause" oder "postGame" ist
    if (state === pause || state === postGame) {
        // Dann den Spielstatus auf "preGame" setzen
        state = preGame;
        // Und das Spiel starten (Countdown-Funktion)
        startGame();
    }
};

// Das Spielfeld dem HTML-Dokument hinzufügen
// Dies erst am Schluss, wenn alles andere erfolgreich geladen wurde
document.body.appendChild(app.view);