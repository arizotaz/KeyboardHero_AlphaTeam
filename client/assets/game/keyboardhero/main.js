//########################################################
// # Dont Touch, use functions below
//########################################################
// Start function one shot
let applicationStarted = false;
// Application Entry Point
function ApplicationMain() {
    if (!applicationStarted) {
        ApplicationStart();
        applicationStarted = true;
    }
    ApplicationLoop();
}
//########################################################

//########################################################
//# MAIN ENTRY POINT
//########################################################
//# This script serves as the entry point of the game.
//# while not the true entry point, boot.js should not
//# be endited and should rather pass off authority to
//# this file.
//########################################################
//# main.js setup and processes the MenuManager
//########################################################

// Menu Manager 
let MenuManager;
// Settings File Structure
let Settings;
// Game Audio Object
let gameAudio;

// Is Mobile
let mobile = false;

// Menu ID alieses
const MENU_MAIN         = 0;
const MENU_SETTINGS     = 1;
const MENU_AUDIOCALI    = 2;
const MENU_ABOUT        = 3;
const MENU_SINGLEPLAYER = 9;
const MENU_GAME_OLD     = 4;
const MENU_COMPLETE_SINGLEPLAYER     = 5;

// Array of game boards
let boards = [];

// Start one-shot.  Called only once at game start
function ApplicationStart() {
    // Create the MenuManager
    MenuManager = new UIManager();
    
    // Create and Load settings structure
    Settings = new KeyFile();
    LoadSettings();
    SetDefaultOptions();

    // Setup Menus
    MenuManager.GoTo(MENU_MAIN);//MENU_GAME);
    // Create the menus
    MenuManager.AddMenu(MENU_MAIN,      new MainMenu    ());
    MenuManager.AddMenu(MENU_SETTINGS,  new SettingsMenu());
    MenuManager.AddMenu(MENU_AUDIOCALI, new AudioCalibrationMenu());
    MenuManager.AddMenu(MENU_ABOUT,     new AboutMenu   ());
    MenuManager.AddMenu(MENU_SINGLEPLAYER,new SinglePlayerGame());
    MenuManager.AddMenu(MENU_COMPLETE_SINGLEPLAYER,  new GameCompletedMenu());

    // Add more menus here
    
}
// Called every frame as long as the game is set to run
function ApplicationLoop() {
    MenuManager.Update();
    MenuManager.Render();
}

function touchStarted() { mobile = true; }
function keyPressed() { mobile = false; }
function IsMobile() {
    return mobile;
}



// Exporting the functions for testing
module.exports = {
    ApplicationMain,
    ApplicationStart,
    ApplicationLoop,
    IsMobile,
    touchStarted, // Exporting touchStarted if you plan to test it
    keyPressed
};
