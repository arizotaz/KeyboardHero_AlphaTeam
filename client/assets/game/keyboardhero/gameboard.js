//########################################################
//# This file contains the object that represents the game
//# board.  This file will handle the render function
//# and processing of the game.  It will not load the file
//# or handle input.  These funciton will instead be
//# handled by the host of this object
let gameTheme = 0;

class GameBoard {
    constructor() {
        this.canUpdate = false;
        this.canRender = true;
        this.input = [];
        this.inputAni = [];
        this.inputOneShots = [];

        this.gameScore = 0;
        this.gameComboMultiplier = 0;

        this.gameFileData = {};
        this.numberOfNotes = 0;
        this.gameTotalTiles = 0;
        this.gameMissedTiles = 0;
        this.gameComplete = false;
        this.maxReachedCombo = 0;

        // Flag to disable combo resets to test combo
        this.debugCombo = 0;
    }
    // When the board is created, must be manually called
    Start() {
        this.canUpdate = true;
        this.canRender = true;
    }
    // Main Update loop, sets a lot of changing variables
    Update(originX, originY, gameWidth, gameHeight, gameAudio) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight
        this.originX = originX;
        this.originY = originY;
        this.gameAudio = gameAudio;
        if (!this.canUpdate) return;


        let particle_force = 50;


        // For each lane
        for (let i = 0; i < this.numberOfNotes; ++i) {

            // flag if gained note
            let gainedNote = false;

            // If the lane's input is down
            let ld = this.input[i];
            if (ld != null && ld) {

                // Get the timestamp of the audio
                let pressedTimeStamp = this.gameAudio.currentTime;

                // Get the timestamp list for the lane and read all values
                let timestamps = this.gameFileData.beatmap_arrays[i].timestamps;
                for (let t = 0; t < timestamps.length; ++t) {
                    // Get the high and low threshold values for a timestamp
                    let timestamp = timestamps[t];
                    let thresHi = timestamp - (collectMSThresh / 1000);
                    let thresLo = timestamp + (collectMSThresh / 1000);

                    // if the input time is within the threshold for the timestamp
                    if (pressedTimeStamp > thresHi && pressedTimeStamp < thresLo) {

                        // Successfully gained a note
                        gainedNote = true;

                        // get the distance from both High and Low in miliseconds
                        let distanceH = Math.abs(thresHi - pressedTimeStamp);
                        let distanceL = Math.abs(thresLo - pressedTimeStamp);

                        // Get the smallest value
                        let distance = distanceH;
                        if (distanceL < distanceH) distance = distanceL;

                        // Get accuracy percentage
                        let percentage = distance / (collectMSThresh / 1000);

                        // Get the integer value of the percentage of maxComboAdd
                        this.gameComboMultiplier += Math.round(maxComboAdd * percentage);

                        //Add to Score
                        this.gameScore += this.gameComboMultiplier * pointsPerNote;

                        if (percentage >= .9) particles.push(new Particle_PERFECT(this.gameWidth / 2, this.gameHeight / 2 - 100, 0, -particle_force));
                        if (percentage >= .8 && percentage < .9) particles.push(new Particle_GREAT(this.gameWidth / 2, this.gameHeight / 2 - 100, 0, -particle_force));
                        if (percentage >= .7 && percentage < .8) particles.push(new Particle_GOOD(this.gameWidth / 2, this.gameHeight / 2 - 100, 0, -particle_force));
                        if (percentage < .7) particles.push(new Particle_OK(this.gameWidth / 2, this.gameHeight / 2 - 100, 0, -particle_force));


                        // Remove from list to prevent double tapping the same note
                        timestamps.splice(t, 1)
                    }
                }
            }

            // if lane is down but did not gain a note
            if (ld && !gainedNote) {
                // if debug flag is on then don't reset combo on miss
                if (!this.debugCombo) {
                    this.gameComboMultiplier = 0;
                    particles.push(new Particle_MISS(this.gameWidth / 2, this.gameHeight / 2 - 100, 0, -particle_force));
                }
            }
        }

        // Compute missed tiles
        for (let i = 0; i < this.numberOfNotes; ++i) {
            // Get user input time
            let pressedTimeStamp = this.gameAudio.currentTime;

            // Get array
            let timestamps = this.gameFileData.beatmap_arrays[i].timestamps;
            for (let t = 0; t < timestamps.length; ++t) {

                // Get the low threshold values for a timestamp
                let timestamp = timestamps[t];

                // Add multiplier to shift it down
                let thresLo = timestamp + (collectMSThresh / 1000) * 2;

                // If note was passed
                if (pressedTimeStamp > thresLo) {
                    // if debug flag is on then don't reset combo on miss
                    if (!this.debugCombo) {
                        // Reset Combo, Add to missed tiles, remove from list
                        this.gameComboMultiplier = 0;
                        ++this.gameMissedTiles;
                        timestamps.splice(t, 1);
                        particles.push(new Particle_MISS(this.gameWidth / 2, this.gameHeight / 2 - 100, 0, -particle_force));
                    }
                }
            }
        }

        // Get Max Reached Combo
        if (this.gameComboMultiplier > this.maxReachedCombo) {
            this.maxReachedCombo = this.gameComboMultiplier;
        }

        // Game is done when audio is completed
        this.gameComplete = GetAudioCompletion(this.gameAudio) >= 1;




        for (let i = 0; i < this.numberOfNotes; ++i) {
            if (this.inputAni[i] != null && this.inputAni[i] > 0)
                this.inputAni[i] -= deltaTime/1000;
            if (this.input[i] != null && this.input[i] > 0)
                this.inputAni[i] = .25;
        }
    }

    // Draws to the screen at the position specified in Update
    Render() {
        if (!this.canRender) return;
        this.DrawGameLaneBackgrounds(this.originX,this.originY);

        let buttonSize = this.gameWidth/this.numberOfNotes/2;
        this.DrawGameBar(this.originX, this.originY+this.gameHeight/2-buttonSize/2,buttonSize);
        this.DrawGameTiles(this.originX, this.originY + this.gameHeight / 2 - buttonSize/2, GetAudioCompletion(this.gameAudio));
    }

    // The Colors at the bottom of the screen
    DrawGameBar(ox, oy, bs) {
        let noteRowSize = this.gameWidth / this.numberOfNotes;

        let buttonSize = bs;

        for (let i = 0; i < this.numberOfNotes; ++i) {

            // Color decrease when active
            if (this.input[i] == null) this.input[i] = null;


            fill(255);
            if (this.inputAni[i] > 0) {
                // Down
                image(GetTexture(ThemeLaneKeyDown(gameTheme, i)), ox - this.gameWidth / 2 + noteRowSize / 2 + noteRowSize * i,
                    oy,
                    noteRowSize,
                    buttonSize
                );
            } else {
                // UP
                image(GetTexture(ThemeLaneKeyUp(gameTheme, i)), ox - this.gameWidth / 2 + noteRowSize / 2 + noteRowSize * i,
                    oy,
                    noteRowSize,
                    buttonSize
                );
            }


            // Draw the corresponding key label on each button
            fill(255);
            textAlign(CENTER, CENTER);
            textSize(24);  // You can adjust the size as needed
            text(String.fromCharCode(this.input_keys[i]), ox - this.gameWidth / 2 + noteRowSize / 2 + noteRowSize * i,
            oy,
            );
        }
    }


    // Lane Key BGs
    DrawGameLaneBackgrounds(ox,oy) {

        let noteRowSize = this.gameWidth / this.numberOfNotes;

        for (let i = 0; i < this.numberOfNotes; ++i) {
            if (this.inputAni[i] > 0) {
                image(GetTexture(ThemeLaneBGDown(gameTheme,i)), ox - this.gameWidth / 2 + noteRowSize / 2 + noteRowSize * i,oy,noteRowSize,this.gameHeight);
            } else {
                image(GetTexture(ThemeLaneBGUp(gameTheme,i)), ox - this.gameWidth / 2 + noteRowSize / 2 + noteRowSize * i,oy,noteRowSize,this.gameHeight);
            }

        }

    }

    // Draw the Game Tiles based on game completion
    // hx is the home x position
    // hy is the home y position - location where tiles become negative
    // gc is game completion [0,1]
    DrawGameTiles(hx, hy, gc) {
        if (this.gameFileData == null) return;
        // Get the width of each lane
        let noteRowSize = this.gameWidth / this.numberOfNotes;
        // Store timestamps
        let beatmap_arrays = this.gameFileData.beatmap_arrays;

        // for each lane that exists
        for (let i = 0; i < this.numberOfNotes; ++i) {
            let beatmap_array = beatmap_arrays[i];
            if (beatmap_array != null) {
                // Get the origin of the lane and draw the tiles in the lane
                let lhx = hx - this.gameWidth / 2 + noteRowSize / 2 + noteRowSize * i;
                let lhy = hy;

                this.DrawTilesInLane(beatmap_array, noteRowSize, lhx, lhy, gc);
            }
        }
    }

    // Draws the tiles for a specific array of time stamps
    DrawTilesInLane(beatmap_array, nrs, lhx, lhy, gc) {
        // Store pass over values
        let noteRowSize = nrs;
        let timestamps = beatmap_array.timestamps;

        // The height of the highest note possible
        let laneHeight = this.gameAudio.duration * noteRowSize * gameSpeedMultiplier;

        // for each timestamp
        for (let i = 0; i < timestamps.length; ++i) {
            let timestamp = timestamps[i];

            // Get the normalized position of the timestamp with respect to song length
            let locPer = timestamp / this.gameAudio.duration;
            // Multiply the normalized value by highest possible note, this is our render y value
            let location = locPer * laneHeight;

            // Set render parms
            let x = lhx;
            let y = lhy - location + gc * laneHeight;
            let w = noteRowSize/1.4;
            let h = noteRowSize * .9;
            h = ((collectMSThresh / 1000) / this.gameAudio.duration) * laneHeight;

            // If the note is visible on the screen, render, otherwise dont
            if (y > -this.gameHeight / 2 - h / 2 && y < this.gameHeight / 2 + h / 2) {
                fill(255);
                image(GetTexture(ThemeTile(gameTheme)),x, y, w, h)
            }
        }
    }

    ProcessInput(gameInputKeys) {
        this.input_keys = gameInputKeys;

        // Reset all input flags to 0
        for (let i = 0; i < this.input.length; ++i) this.input[i] = 0;

        // If Desktop Mode
        if (!IsMobile()) {
            // For each key in array
            for (let i = 0; i < this.input_keys.length; ++i) {
                // Set default value if it does not exits
                if (this.input[i] == null) this.input[i] = 0;
                // If the key is not down, set input to zero and reset oneshot
                if (!keyIsDown(this.input_keys[i])) { this.input[i] = 0; this.inputOneShots[i] = null; }
                // If the key is down, set it to false.  Respect the one shot
                if (keyIsDown(this.input_keys[i]) && this.inputOneShots[i] == null) { this.input[i] = 1; this.inputOneShots[i] = true; }
            }
        } else {
            // If Mobile Mode
            let noteRowSize = this.gameWidth / this.numberOfNotes;
            for (let i = 0; i < this.numberOfNotes; ++i) {
                // Input in lane
                let ld = false;

                // Set default value if it does not exits
                if (this.input[i] == null) this.input[i] = 0;

                // If any touch falls in the lane, set true
                for (let touch of touches) {
                    if (touch.x - windowWidth / 2 + this.originX < -this.gameWidth / 2 + noteRowSize / 2 + noteRowSize * i + noteRowSize / 2 && touch.x - windowWidth / 2 + this.originX > -this.gameWidth / 2 + noteRowSize / 2 + noteRowSize * i - noteRowSize / 2) {
                        // Input detected in this lane
                        ld = true;

                        // If one shot is not active
                        if (!this.inputOneShots[i]) {
                            // Activate one shot and set input
                            this.input[i] = 1;
                            this.inputOneShots[i] = true;
                        }
                    }
                }

                // If input was not detected in lane, reset oneshot
                if (!ld) this.inputOneShots[i] = null;
            }
        }
    }

    MarkReady() {
        this.canUpdate = true;
        this.canRender = true;
    }
    Ready() {
        return this.canUpdate;
    }

    // Load Data
    LoadFileData(dataJSON) {
        this.gameFileData = dataJSON;
        // number of lanes
        this.numberOfNotes = this.gameFileData.beatmap_arrays.length;
        this.gameTotalTiles = 0;
        this.gameMissedTiles = 0;
        for (let l = 0; l < this.gameFileData.beatmap_arrays.length; ++l) {
            let timestamps = this.gameFileData.beatmap_arrays[l].timestamps;
            for (let t = 0; t < timestamps.length; ++t)
                ++this.gameTotalTiles;
        }
    }

    // Completion
    CompletionPercentage() {
        return GetAudioCompletion(this.gameAudio);
    }

    // Is the game completed
    Completed() { return this.gameComplete; }

    // Returns Score
    Score() {
        return this.gameScore;
    }
    // Returns total tiles
    TotalNotes() {
        return this.gameTotalTiles;
    }
    // Returns missed tiles
    MissedNotes() {
        return this.gameMissedTiles;
    }
    // Returns max reached combo
    MaxReachedCombo() {
        return this.maxReachedCombo;
    }

    // Width of column
    ColumnWidth() {
        return this.numberOfNotes;
    }

    // Call when destroyed
    Exit() {

    }

}


function DrawGameBG() {
    background(50);
    fill(255);
    let img = GetTexture(ThemeBackground(gameTheme));
    let w = img.width;
    let h = img.height;
    let haspect = w / h;
    let waspect = h / w;
    if (haspect * windowHeight >= windowWidth) {
        image(img, 0, 0, haspect * windowHeight, windowHeight);

    } else {
        image(img, 0, 0, windowWidth, windowWidth * waspect);
    }
}

function GetAudioCompletion(audio) {
    if (audio == null) return 0;
    return audio.currentTime / audio.duration;
}
