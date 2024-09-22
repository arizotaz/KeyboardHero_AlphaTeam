//########################################################
//# This is the file for the main game script.  It
//# contains the logic of base game and user input
//#

let gameWidth = 500;            // play area in pixels
let   numberOfNotes = 4;        // number of tracks, dictated by file
const gameSpeedMultiplier = 4;  // Speed and spacing of tiles
let   gameArtiLatency = 2/1000; // Added latency in seconds
// List of input status per lane, one shot limits the user to tapping key rather than holding
let input = [], inputOneShots = [];

// The URL to get the song data, this will be assigned else where later
let gameFileURI = "assets/game/keyboardhero/levels/solopiano2.json";
// Is the game loading the URL above?
let loadingGameFile = false; // 0 = false, (0,1) animation state, 1 = true
// Store the JSON Data of the URL above
let gameFileData;

// The threshold of Milisecond a tap counts as colleted
let collectMSThresh = 120;

// Main Audio Object
let gameAudio = null;

// Game Complete Flag
let gameComplete = false;

// Called when game is shown
function GameStart() {
    // Set complete flag
    gameComplete = false;

    // Set Load file flag
    loadingGameFile = true;

    // audio;
    gameAudio = null;

    // Download data from URI, simple JQuery/Ajax
    // statement to get the text of another url
    $.ajax({
        url: gameFileURI,
        type: "GET",
        dataType: "text",
        success: function (data) {
            try {
                // Pass collected data to load function
                LoadGameFile(data);
            } catch(e) {
                // Deal with this later, but for now
                // halt the game on error
                ThrowError(e);
            }
        }
    });
}
// Update/Game Logic function
function GameUpdate() {
    // If game is over, stop running update look
    if (gameComplete) return;

    // If the loading file flag is in the animation state, decrement it by deltatime
    // If it is equal to zero in this statement, set it beyond zero so the next
    // statement is true
    if (loadingGameFile < 1 && loadingGameFile != 0) { loadingGameFile -= deltaTime/1000; if (loadingGameFile == 0) loadingGameFile = -0.01}

    // If the flag is less than zero, set it to zero and start the audio
    if (loadingGameFile < 0) { loadingGameFile = 0; gameAudio.play(); }


    

    // input, stored as an array of integers.
    // for example, if input[3] == 1, then the 4th lane is active

    // Keys are, D, F, J, K, L
    let input_keys = [68,70,74,75,76];
    
    // Reset all input flags to 0
    for (let i = 0; i < input.length; ++i) input[i] = 0;

    // For each key in array
    for (let i = 0; i < input_keys.length; ++i) {
        // Set default value if it does not exits
        if (input[i] == null) input[i] = 0;
        // If the key is not down, set input to zero and reset oneshot
        if (!keyIsDown(input_keys[i])) { input[i] = 0; inputOneShots[i] = null; }
        // If the key is down, set it to false.  Respect the one shot
        if ( keyIsDown(input_keys[i]) && inputOneShots[i] == null) { input[i] = 1; inputOneShots[i] = true; }
    }
    
    // Stop update from continuing if loading
    if (loadingGameFile > 0) return;

    // For each lane
    for (let i = 0; i < numberOfNotes; ++i) {
        // If the lane's input is down
        let ld = input[i];
        if (ld != null && ld) {
            // Get the timestamp of the audio
            let pressedTimeStamp = gameAudio.currentTime;

            // Get the timestamp list for the lane and read all values
            let timestamps = gameFileData.beatmap_arrays[i].timestamps;                        
            for (let t = 0; t < timestamps.length; ++t) {
                // Get the high and low threshold values for a timestamp
                let timestamp = timestamps[t];
                let thresHi = timestamp+(collectMSThresh/1000);
                let thresLo = timestamp-(collectMSThresh/1000);

                // if the input time is within the threshold for the timestamp
                if (pressedTimeStamp < thresHi && pressedTimeStamp > thresLo) {

                    // get the distance from both High and Low in miliseconds
                    let distanceH = Math.abs(thresHi-pressedTimeStamp);
                    let distanceL = Math.abs(thresLo-pressedTimeStamp);

                    // Get the smallest value
                    let distance = distanceH;
                    if (distanceL < distanceH) distance = distanceL;

                    // Get accuracy percentage
                    let percentage = distance/(collectMSThresh/1000)

                    // Remove from list to prevent double tapping the same note
                    timestamps.splice(t,1)
                }
            }
        }
    }

    // Game is done when audio is completed
    gameComplete = GetAudioCompletion() >= 1; 

}
// Draw to the screen
function GameRender() {
    // If game is complete, render win screen and nothing else
    if (gameComplete) {
        DrawCompleteScreen();
        return;
    }

    // Clamp game width to 500px
    gameWidth = windowWidth;
    if (gameWidth > 500) gameWidth = 500;

    // Draw BG Image
    DrawGameBG();

    // If the file has loaded or is in the animation state
    if (loadingGameFile < 1)
        DrawGameTiles(0,windowHeight/2-(gameWidth/numberOfNotes)/2,GetAudioCompletion());

    // Draw the Lightup buttons at the bottom of the screen
    DrawGameBar();

    // Draw Loading screen if animation is not done or the file is loading
    if (loadingGameFile > 0) {
        DrawLoadGameFileScreen();
    }

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

    // Colors of buttons
    let colors = [
        color( 42, 125,  45), // Green
        color(179,  44,  23), // Red
        color(229, 232,  44), // Yellow
        color(198,  39, 207), // Purple
        color(224, 146,  36), // Orange
    ];
    // For each note
    for (let i = 0; i < numberOfNotes; ++i) {
        // Color increase when active
        let incLevel = 40;
        if (colors[i] == null) colors[i] = color(140, 140, 140);
        tint(color( colors[i].levels[0]+incLevel*input[i],
                    colors[i].levels[1]+incLevel*input[i],
                    colors[i].levels[2]+incLevel*input[i]
        ));
        // Lighup part
        image(GetTexture("button_top"),-gameWidth/2+noteRowSize/2+noteRowSize*i,
             windowHeight/2-noteRowSize/2,
              noteRowSize,
              noteRowSize
        );
        // Button base
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
    background(50);
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

// Loading Game Screen
function DrawLoadGameFileScreen() {
    // Back overlay with an alpha value between [0,255]
    fill(0,0,0,255*loadingGameFile);
    rect(0,0,windowWidth,windowHeight);
}

// Draw the Game Tiles based on game completion
// hx is the home x position
// hy is the home y position - location where tiles become negative
// gc is game completion [0,1]
function DrawGameTiles(hx, hy, gc) {
    // Get the width of each lane
    let noteRowSize = gameWidth/numberOfNotes;
    // Store timestamps
    let beatmap_arrays = gameFileData.beatmap_arrays;

    // for each lane that exists
    for (let i = 0; i < numberOfNotes; ++i) {
        let beatmap_array = beatmap_arrays[i];
        if (beatmap_array != null) {
            // Get the origin of the lane and draw the tiles in the lane
            let lhx = hx-gameWidth/2+noteRowSize/2+noteRowSize*i;
            let lhy = hy;
            DrawTilesInLane(beatmap_array,noteRowSize,lhx,lhy,gc);
        }
    }
}

// Draws the tiles for a specific array of time stamps
function DrawTilesInLane(beatmap_array,nrs,lhx,lhy,gc) {
    // Store pass over values
    let noteRowSize = nrs;
    let timestamps = beatmap_array.timestamps;

    // The height of the highest note possible
    let laneHeight = gameAudio.duration*noteRowSize*gameSpeedMultiplier;
    // for each timestamp
    for (let i = 0; i < timestamps.length; ++i) {
        let timestamp = timestamps[i];

        // Get the normalized position of the timestamp with respect to song length
        let locPer = timestamp/gameAudio.duration;
        // Multiply the normalized value by highest possible note, this is our render y value
        let location = locPer*laneHeight;

        // Set render parms
        let x = lhx;
        let y = lhy-location+gc*laneHeight;
        let w = noteRowSize/2;
        let h = noteRowSize*.9;

        // If the note is visible on the screen, render, otherwise dont
        if (y > -windowHeight/2-h/2 && y < windowHeight/2+h/2) {
            fill(255);
            rect(x, y,w,h)
        }
    }
}


// Takes the text data, and pulls the parts needed for the game
function LoadGameFile(data) {
    // Parse the data
    gameFileData = JSON.parse(data);

    // number of lanes
    numberOfNotes = gameFileData.beatmap_arrays.length;

    // Create audio object from base64
    gameAudio = new Audio(gameFileData.data);

    // Run Finish Loop
    FinishGFLOnTexDone();
}
// Only mark the loading as finished if all textures are loaded
function FinishGFLOnTexDone() {
    if (loadingList.length <= 0) {
        loadingGameFile = .999;
    } else {
        // Textures not loaded, wait 500ms and try again
        setTimeout(FinishGFLOnTexDone,500);
    }
    
}

// Gets the percentage of audio completion [0,1]
function GetAudioCompletion() {
    if (gameAudio == null) return 0;
    return gameAudio.currentTime/gameAudio.duration;
}

// Draws the screen seen when a song is completed
// This should and shall change later
function DrawCompleteScreen() {
    fill(200);
    rect(0,0,windowWidth,windowHeight);

    let missedTiles = 0;
    for (let l = 0; l < gameFileData.beatmap_arrays.length; ++l) {
        let timestamps = gameFileData.beatmap_arrays[l].timestamps;
        for (let t = 0; t < timestamps.length; ++t)
            ++missedTiles;
    }

    fill(0);
    textSize(48);
    textAlign(CENTER,BOTTOM)
    text("Thats a wrap!",0,0);
    textSize(32);
    text("Score: %&#",0,48);
    text("Missed Tiles: " + missedTiles,0,48+32);


}


// Game Menu Wrapper
class GameViewMenu extends Menu {
    Open  () { GameStart (); }
    Update() { GameUpdate(); }
    Render() { GameRender(); }
    Leave () { GameExit  (); }
}