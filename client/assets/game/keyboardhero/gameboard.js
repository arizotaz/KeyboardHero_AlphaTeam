//########################################################
//# This file contains the object that represents the game
//# board.  This file will handle the render function
//# and processing of the game.  It will not load the file
//# or handle input.  These funciton will instead be
//# handled by the host of this object
let gameTheme = 0;

ChangeGameTheme(1);

function ChangeGameTheme(id) {
    gameTheme = id;
    LoadTheme(id);
}

class GameBoard {
    constructor() {
        this.canUpdate = false;
        this.canRender = true;
        this.input = [];
        this.inputAni = [1,1,1,1,1,1,1];
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


        this.gameCompletionPercentage = -100;
        this.gameStartCountdown = 4;
        this.gameAudioCurrentTime = 0;
        this.gameAudioLastPoll = 0;

        this.songName = "Loading...";
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

                        // If debug is active then make every input perfect
                        if (this.debugCombo) percentage = 1;
                        
                        // Get the integer value of the percentage of maxComboAdd
                        this.gameComboMultiplier += Math.round(maxComboAdd * percentage);

                        //Add to Score
                        this.gameScore += this.gameComboMultiplier * pointsPerNote;

                        if (percentage >= .9) particles.push(new Particle_PERFECT(this.particleXOrigin,this.particleYOrigin, 0, -particle_force));
                        if (percentage >= .8 && percentage < .9) particles.push(new Particle_GREAT(this.particleXOrigin,this.particleYOrigin, 0, -particle_force));
                        if (percentage >= .7 && percentage < .8) particles.push(new Particle_GOOD(this.particleXOrigin,this.particleYOrigin, 0, -particle_force));
                        if (percentage < .7) particles.push(new Particle_OK(this.particleXOrigin,this.particleYOrigin, 0, -particle_force));


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
                    particles.push(new Particle_MISS(this.particleXOrigin,this.particleYOrigin, 0, -particle_force));
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
                        particles.push(new Particle_MISS(this.particleXOrigin,this.particleYOrigin, 0, -particle_force));
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



        // Holds the input in another array for .25 seconds to display presses
        for (let i = 0; i < this.numberOfNotes; ++i) {
            if (this.inputAni[i] != null && this.inputAni[i] > 0)
                this.inputAni[i] -= deltaTime/1000;
            if (this.input[i] != null && this.input[i] > 0)
                this.inputAni[i] = .25;
        }


        // if countdown is greater than 0
        if (this.gameStartCountdown > 0) {
            // set board to negative duration to keep the tiles above the screen
            this.gameCompletionPercentage = (-this.gameStartCountdown/this.gameAudio.duration);
            // decrement this time
            this.gameStartCountdown -= deltaTime/1000;
        } else {
            // One shot to play music using gameStartCountdown, since its not longer in use
            if (this.gameStartCountdown != -100) {
                gameAudio.play();
                this.gameStartCountdown = -100;
            }

            // Music smoothing function
            // Firefox does not update the audio.currentTime handle as requently as edge or chome
            // instead we keep updating the currentTime as a seperate value, and correct it when
            // the browser updates
            this.gameAudioCurrentTime += deltaTime/1000;
            if (this.gameAudio.currentTime != this.gameAudioLastPoll) {
                this.gameAudioLastPoll = this.gameAudio.currentTime;
                this.gameAudioCurrentTime = this.gameAudioLastPoll;
            }
            
            // Game completion using the new time
            this.gameCompletionPercentage = this.gameAudioCurrentTime/this.gameAudio.duration;
        }
        

    }

    // Draws to the screen at the position specified in Update
    Render() {
        if (!this.canRender) return;
        this.DrawGameLaneBackgrounds(this.originX,this.originY);

        let buttonSize = this.gameWidth/this.numberOfNotes/2;
        this.DrawGameBar(this.originX, this.originY+this.gameHeight/2-buttonSize/2,buttonSize);
        this.DrawGameTiles(this.originX, this.originY + this.gameHeight / 2 - buttonSize/2, this.gameCompletionPercentage);
    }

    // Draw left and right panels
    RenderGameStats() {
        // Get Space left over from game board
        let sectionWidth = windowWidth-this.gameWidth;

        // Get the size of each side
        sectionWidth = sectionWidth/2;

        if (windowWidth > 1000) {
            this.DrawLeftSec (this.originX-windowWidth/2+sectionWidth/2,this.originY,sectionWidth,this.gameHeight);
            this.DrawRightSec(this.originX+windowWidth/2-sectionWidth/2,this.originY,sectionWidth,this.gameHeight);
        } else {
            this.particleXOrigin = this.originX+this.gameWidth/2+100;
            this.particleYOrigin = this.originY+this.gameHeight/2;
            
        }
        
    }

    DrawLeftSec(x,y,w,h) {

        let sectionHeight = h/3;

        let headerFontSize = sectionHeight/5;
        let fontSize = headerFontSize/1.2; 


        fill(255);
        textAlign(CENTER,CENTER);

        textSize(headerFontSize);
        textFont('Berlin Sans FB');
        text("Score",x,y-sectionHeight-fontSize/2);
        textSize(fontSize);
        //textFont('Courier New');
        text(this.gameScore,x,y-sectionHeight+fontSize/2);

        textSize(headerFontSize);
        textFont('Berlin Sans FB');
        text("Combo",x,y-fontSize/2);
        textSize(fontSize);
        //textFont('Courier New');
        text("X"+this.gameComboMultiplier,x,y+fontSize/2);

        textSize(headerFontSize);
        textFont('Berlin Sans FB');
        text("Missed",x,y+sectionHeight-fontSize/2);
        textSize(fontSize);
        //textFont('Courier New');
        text(this.gameMissedTiles,x,y+sectionHeight+fontSize/2);
        
    }
    DrawRightSec(x,y,w,h) {

        let sectionHeight = h/4;

        let headerFontSize = w/this.songName.length*1.5; 
        let fontSize = headerFontSize/1.2; 

        textSize(headerFontSize);
        textFont('Berlin Sans FB');
        text(this.songName,x,y-sectionHeight-fontSize/2,w,h);


        this.particleXOrigin = x;
        this.particleYOrigin = y+sectionHeight+fontSize/2;

        let per = this.gameCompletionPercentage;
        if (per < 0) per = 0;
        let bh = 20;
        fill(0);
        rect(x,y-sectionHeight+fontSize/2,headerFontSize*this.songName.length/2,10);

        let px = x;
        let py = y-sectionHeight+fontSize/2;
        let ph = 10;
        let pw = headerFontSize*this.songName.length/2;

        let endWidth = 5;

        let fillSize = pw-endWidth/2

        image(GetTexture(ThemeProgressBG (gameTheme)),px,py,fillSize,ph);
        image(GetTexture(ThemeProgressBGE(gameTheme)),px+pw/2-endWidth/2,py,endWidth,ph);
        image(GetTexture(ThemeProgressBGB(gameTheme)),px-pw/2+endWidth/2,py,endWidth,ph);

        let perw = pw*per;
        fillSize = perw-endWidth/2;
        image(GetTexture(ThemeProgressFill (gameTheme)),px-pw/2+endWidth+fillSize/2,py,fillSize,ph);
        image(GetTexture(ThemeProgressFillE(gameTheme)),px-pw/2+endWidth+fillSize+endWidth/2,py,endWidth,ph);
        image(GetTexture(ThemeProgressFillB(gameTheme)),px-pw/2+endWidth/2,py,endWidth,ph);
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
        this.songName = this.gameFileData.song_title;
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

    StartCountdown() {
        return this.gameStartCountdown;
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
