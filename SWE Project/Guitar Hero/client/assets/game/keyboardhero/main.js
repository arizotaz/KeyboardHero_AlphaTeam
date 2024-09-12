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

// Menu ID alieses
const MENU_MAIN     = 0;
const MENU_SELECT   = 1;
const MENU_SETTINGS = 2;
const MENU_GAME     = 5

// Start one-shot.  Called only once at game start
function ApplicationStart() {
    // Create the MenuManager
    MenuManager = new UIManager();
    // Setup Menus
    MenuManager.GoTo(MENU_MAIN);//MENU_GAME);
    // Create the menus
    MenuManager.AddMenu(MENU_MAIN,      new MainMenu        ());
    MenuManager.AddMenu(MENU_SELECT,    new DiffSelectMenu  ());
    MenuManager.AddMenu(MENU_SETTINGS,  new SettingsMenu     ());
    MenuManager.AddMenu(MENU_GAME,      new GameViewMenu    ());
    // Add more menus here
    
}
// Called every frame as long as the game is set to run
function ApplicationLoop() {
    MenuManager.Update();
    MenuManager.Render();
}