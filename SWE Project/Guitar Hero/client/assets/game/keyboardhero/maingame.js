//########################################################
//# This is the file for the main game script.  It
//# contains the logic of base game and user input
//#

let gameWidth = 500; // play area in pixels
const numberOfNotes = 5;
let input = [];
// Called when game is shown
function GameStart() {

}
// Update/Game Logic function
function GameUpdate() {

    // input, stored as an array of integers.
    // for example, if input[3] == 1, then the 4th lane is active

    for (let i = 0; i < numberOfNotes; ++i) input[i] = 0;
    if (keyIsDown(68)) input[0] = 1; // D
    if (keyIsDown(70)) input[1] = 1; // F
    if (keyIsDown(74)) input[2] = 1; // J
    if (keyIsDown(75)) input[3] = 1; // K
    if (keyIsDown(76)) input[4] = 1; // L
    


}
// Draw to the screen
function GameRender() {
    // BG Image
    DrawGameBG();

    // The Lightup buttons at the bottom of the screen
    DrawGameBar();

    // FPS Text
    fill(255);
    textSize(18);
    textAlign(LEFT,TOP);
    text(Math.round(frameRate()) + " FPS", -windowWidth/2,-windowHeight/2);
}

// Called on game exit/menu change
function GameExit() {

}

// The Colors at the bottom of the screen
function DrawGameBar() {
    let noteRowSize = gameWidth/numberOfNotes;

    let colors = [
        color(42, 125, 45), // Green
        color(179, 44, 23), // Red
        color(229, 232, 44), // Yellow
        color(198, 39, 207), // Purple
        color(224, 146, 36), // Orange
    ];
    for (let i = 0; i < numberOfNotes; ++i) {
        let incLevel = 40;
        tint(color( colors[i].levels[0]+incLevel*input[i],
                    colors[i].levels[1]+incLevel*input[i],
                    colors[i].levels[2]+incLevel*input[i]
        ));
        image(GetTexture("button_top"),-gameWidth/2+noteRowSize/2+noteRowSize*i,
             windowHeight/2-noteRowSize/2,
              noteRowSize,
              noteRowSize
        );
        noTint();
        fill(255);
        image(GetTexture("button_base"),-gameWidth/2+noteRowSize/2+noteRowSize*i,
        windowHeight/2-noteRowSize/2,
         noteRowSize,
         noteRowSize);
    }
}

// Background that will fill the screen
function DrawGameBG() {
    fill(255);
    let img = GetTexture("game_background");
    let w = img.width;
    let h = img.height;
    let haspect = w/h;
    let waspect = h/w;
    if (haspect*windowHeight >= windowWidth) {
        image(img,0,0,haspect*windowHeight,windowHeight);

    } else {
        image(img,0,0,windowWidth,windowWidth*waspect);
    }
}





// Game Menu Wrapper
class GameViewMenu extends Menu {
    Open  () { GameStart (); }
    Update() { GameUpdate(); }
    Render() { GameRender(); }
    Leave () { GameExit  (); }
}