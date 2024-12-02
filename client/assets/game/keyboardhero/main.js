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
let gameAudio, menuAudio;

// Is Mobile
let mobile = false;

// Menu ID alieses
const MENU_MAIN                     = 0;
const MENU_SETTINGS                 = 1;
const MENU_AUDIOCALI                = 2;
const MENU_ABOUT                    = 3;
const MENU_GAME_OLD                 = 4;
const MENU_COMPLETE_SINGLEPLAYER    = 5;
const MENU_UPLOAD_SONGS             = 6;
const MENU_LOGIN                    = 7;
const MENU_REGISTER                 = 8;
const MENU_SINGLEPLAYER             = 9;
const MENU_LEVELSELECT              = 10;
const MENU_STATISTICS               = 11;

const MENU_MULTIPLAYER              = 30;
const MENU_MULTIPLAYER_SETUP        = 31;
const MENU_MULTIPLAYER_HOST         = 32;
const MENU_MULTIPLAYER_JOIN         = 33;
const MENU_MULTIPLAYER_GAME         = 34;

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
    MenuManager.GoTo(MENU_MAIN);
    // Create the menus
    MenuManager.AddMenu(MENU_MAIN,                  new MainMenu            ());
    MenuManager.AddMenu(MENU_SETTINGS,              new SettingsMenu        ());
    MenuManager.AddMenu(MENU_AUDIOCALI,             new AudioCalibrationMenu());
    MenuManager.AddMenu(MENU_ABOUT,                 new AboutMenu           ());
    MenuManager.AddMenu(MENU_SINGLEPLAYER,          new SinglePlayerGame    ());
    MenuManager.AddMenu(MENU_COMPLETE_SINGLEPLAYER, new GameCompletedMenu   ());
    MenuManager.AddMenu(MENU_LEVELSELECT,           new LevelSelectorMenu   ());
    MenuManager.AddMenu(MENU_UPLOAD_SONGS,          new UploadSongsMenu     ());
    
    MenuManager.AddMenu(MENU_LOGIN,                 new LoginMenu           ());
    MenuManager.AddMenu(MENU_REGISTER,              new RegisterMenu        ());
    MenuManager.AddMenu(MENU_STATISTICS,            new StatisticsMenu      ());
//
    // Add more menus here
    
}
// Called every frame as long as the game is set to run
function ApplicationLoop() {
    MenuManager.Update();
    DrawGameBG();
    MenuManager.Render();
}

function touchStarted() { mobile = true; }
function keyPressed() { mobile = false; }
function IsMobile() {
    return mobile;
}



// Exporting the functions for testing
/*
module.exports = {
    ApplicationMain,
    ApplicationStart,
    ApplicationLoop,
    IsMobile,
    touchStarted, // Exporting touchStarted if you plan to test it
    keyPressed
};
*/
