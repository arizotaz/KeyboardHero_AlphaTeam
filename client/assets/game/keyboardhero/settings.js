//########################################################
//# Settings File
//########################################################
//# This script uses a structure called KeyFile.  Key file
//# is a simple class that manages values associated to
//# keys.  KeyFile can then turn this data into text, or
//# load from text.
//# 
//# "Settings" is the name of a variable of type KeyFile
//# KeyFile has the following functions:
//#     Keys() - returns a list of keys in the file
//#     KeyExists(key) - returns true if key is present
//#     SetKey(key,value) - sets the value of a get
//#     GetKey(key) - Gets the value of a key
//#     GetAsText() - returns the Stringified JSON
//#     LoadFromText(text) - opposite of GetAsText()
//########################################################
//# EXAMPLE
//########################################################
//# Settings.SetKey("username","John Doe");
//# let user = Settings.GetKey("username");
//# 
//# user will equal "John Doe"
//########################################################
//# Saving and Loading
//########################################################
//# Saving and loading is handed with the SaveSettings()
//# and LoadSettings functions.  Load should not need to
//# be called.  Save should be called whenever a change
//# is made.
//#
//# SetDefaultOptions() initialized the file if it does
//# not exist already

// Default keys
const Setting_KeyArray      = "input.keys.types"; // JSON TEXT ARRAY OF KEYCODES
const Setting_GameVolume    = "sound.game"; // Integer [0,1]
const Setting_MenuVolume    = "sound.menu"; // Integer [0,1]


// Sets values to their defaults
function SetDefaultOptions() {
    if (!Settings.KeyExists(Setting_KeyArray))  { Settings.SetKey(Setting_KeyArray,JSON.stringify([[32],[70,74],[70,74],[68,70,74,75],[68,70,74,75,76]])); }
    if (!Settings.KeyExists(Setting_GameVolume)){ Settings.SetKey(Setting_GameVolume,1) }
    if (!Settings.KeyExists(Setting_MenuVolume)){ Settings.SetKey(Setting_MenuVolume,1) }
    SaveSettings();
}

// Saves the settings file to localstorage
function SaveSettings() {
    localStorage.setItem("game.settings", Settings.GetAsText());
}

// Loads settings file from local storage
function LoadSettings() {
    let settingsText = localStorage.getItem("game.settings");
    if (settingsText != null && settingsText != "") {
        try {
            Settings.LoadFromText(settingsText);
        } catch (e) {
            console.error("FAILED TO LOAD SETTINGS");
            console.error(e);
        }
    }
}

// A simple structure to load and set values by key.
class KeyFile {
    // Set default data
    constructor() { this.data = {}; }

    // Returns the keys in the list
    Keys() { return Object.keys(this.data); }

    // Checks if a key is present in the list, TRUE OR FALSE
    KeyExists(key) { return this.data[key] != null; }

    // Returns the value at a key, will return null if it does not exist
    GetKey(key) { return this.data[key]; }
    
    // Sets the value of a key
    SetKey(key, value) { this.data[key] = value; }

    // Takes the content and loads it into the object
    GetAsText() { return JSON.stringify(this.data); }

    // Converts the object to text
    LoadFromText(data) { this.data = JSON.parse(data); }
}