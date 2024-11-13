// Settings for the game
const pointsPerNote = 1; // points given when a note is collected, multiplied by combo
const maxComboAdd = 3; // max amount to increases the combo
const gameSpeedMultiplier = 4;  // Speed and spacing of tiles
let collectMSThresh = 200; // MS Threshold to collect a note

// The URL to get the song data, this will be assigned else where later
let gameFileURI = "assets/game/keyboardhero/levels/solopiano2.json";
let gamePASSData = "";
// Has the game started
let singlePlayerStarted = false;

// Game Board render origin
let spOFFX = 0, spOFFY = 0;

let game_input_keys;


function LoadSinglePlayerData(data) {
    try {
        // Parse the data
        let gameFileData = JSON.parse(data);

        // Create audio object from base64
        gameAudio = new Audio(gameFileData.data);

        // Set the game theme based on the file
        if (gameFileData.theme != null && Number.isInteger(gameFileData.theme)) {
            ChangeGameTheme(gameFileData.theme);
        } else {
            if (gameTheme != 0) ChangeGameTheme(0);
        }

        // Get Game Input Keys
        game_input_keys = JSON.parse(Settings.GetKey(Setting_KeyArray));

        // Load data to board
        boards[0].LoadFileData(gameFileData,game_input_keys);


        // Run Finish Loop
        FinishGFLOnTexDone(boards[0]);
    } catch (e) {
        // Deal with this later, but for now
        // halt the game on error
        ThrowError(e);
    }
}

// Single Player Menu Object
class SinglePlayerGame extends Menu {
    Open() {

        LoadSettings();

        particles = [];

        // Make canvas static
        document.getElementsByTagName("canvas")[0].style.position = "fixed";

        // Reset Start One Shot
        singlePlayerStarted = false;

        // Clear the board object and create a new one at index 0
        
        gameAudio = null;

        boards = [];
        boards[0] = new GameBoard();


        // Download from gameFileURI

        if (gamePASSData == "") {
            $.ajax({
                url: gameFileURI,
                type: "GET",
                dataType: "text",
                success: function (data) {
                    LoadSinglePlayerData(data);
                }
            });
        } else {
            LoadSinglePlayerData(gamePASSData);
            gamePASSData = "";
        }
        


        // Run Start
        //boards[0].Start();
    }
    Update() {

        // Start game when all (one) players are ready
        if (!singlePlayerStarted) {
            let playersReady = true;
            for (let i = 0; i < boards.length; ++i)
                if (!boards[i].Ready()) playersReady = false;
            if (playersReady && gameAudio != null) {
                singlePlayerStarted = true;
                gameAudio.volume = Settings.GetKey(Setting_GameVolume);
            }
        }

        // Set gameWidth to be a max of 500
        let gameWidth = windowWidth;
        if (gameWidth > 500) gameWidth = 500;

        // Process Input and pass keyboard array
        if (boards[0] != null && boards[0].ColumnWidth() != null &&  game_input_keys != null && game_input_keys[boards[0].ColumnWidth()-1] != null)
        boards[0].ProcessInput(game_input_keys[boards[0].ColumnWidth()-1]);
        

        // Run game update loop
        boards[0].Update(spOFFX, spOFFY, gameWidth, windowHeight,gameAudio);

        // Process Particles
        for (let i = 0; i < particles.length; ++i)
            particles[i].Tick();
        
        // End game when all boards are completed and go to MENU_COMPLETE_SINGLEPLAYER
        let gameDone = true;
        for (let i = 0; i < boards.length; ++i)
            if (!boards[i].Completed()) gameDone = false;
        if (gameDone) MenuManager.GoTo(MENU_COMPLETE_SINGLEPLAYER);
    }
    Render() {
        // Draw BG
        DrawGameBG();
        // Render board
        boards[0].Render();
        boards[0].RenderGameStats();

        // Draw Debug Text
        if (window.location.href.includes("localhost"))
            DrawDebugInfo();

        // Render Particles
        for (let i = 0; i < particles.length; ++i)
            particles[i].Render();

        if (boards[0].StartCountdown() > 1) {
            fill(0,0,0,100);
            rect(0,0,windowWidth,windowHeight);
            fill(255);
            textSize(50);
            textAlign(CENTER,CENTER);
            text("Starting in",0,-25);
            text(Math.ceil(boards[0].StartCountdown()) - 1,0,25);
        }
    }
    Leave() {
        // Run Exit function
        boards[0].Exit();
        // Remove fixed flag from canvas
        document.getElementsByTagName("canvas")[0].style.position = "";
        // Pause audio if it's playing
        gameAudio.pause();
        // Clear the screen
        clear();
    }
}


function DrawDebugInfo() {
    // Debug Text
    let dt = Math.round(frameRate()) + " FPS\n";
    dt += "Combo: " + boards[0].gameComboMultiplier + "\n";
    dt += "Score: " + boards[0].gameScore + "\n";
    dt += "Missed: " + boards[0].gameMissedTiles + "\n";
    dt += "Mouse XY: " + mouseX + " - " + mouseY + "\n";


    // Debug Text
    fill(255);
    textSize(18);
    textAlign(LEFT, TOP);
    text(dt, -windowWidth / 2, -windowHeight / 2);
}

// Only mark the loading as finished if all textures are loaded
function FinishGFLOnTexDone(board) {
    if (loadingList.length <= 0) {
        board.MarkReady();
    } else {
        // Textures not loaded, wait 500ms and try again
        setTimeout(function() { FinishGFLOnTexDone(board); }, 500);
    }
}