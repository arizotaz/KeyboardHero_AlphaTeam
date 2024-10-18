
/*Setup and run tests*/
function MakeAndRunTests() {
    
    // Test MenuManager
    CreateTest("Test Scene Manager (To Game)",
        "Tests the menu manager's ability to change screens",
        async function () {
            try {
                MenuManager.GoTo(MENU_SINGLEPLAYER);
                console.log("📋 Changed Menu to " + MENU_SINGLEPLAYER)
                await waitDelay(1000);
                console.log("📋 Menu Manager reports " + MenuManager.GetMenuID())
                if (MenuManager.GetMenuID() != MENU_SINGLEPLAYER) throw new Error('Menu Manager ID did not change');

                return 0;
            } catch (e) {
                return e;
            }
        }
    );
    
    // Test MenuManager again
    CreateTest("Test Scene Manager (To Settings)",
        "Tests the menu manager's ability to change screens",
        async function () {
            try {
                MenuManager.GoTo(MENU_SETTINGS);
                console.log("📋 Changed Menu to " + MENU_SETTINGS)
                await waitDelay(1000);
                console.log("📋 Menu Manager reports " + MenuManager.GetMenuID())
                if (MenuManager.GetMenuID() != MENU_SETTINGS) throw new Error('Menu Manager ID did not change');
                return 0;
            } catch (e) {
                return e;
            }
        }
    );
    
    // Test MenuManager Back operation
    CreateTest("Menu Manager Back Function",
        "Tests the menu manager's to read history and go back",
        async function () {
            try {
                MenuManager.GoTo(MENU_SETTINGS);
                console.log("📋 Changed Menu to " + MENU_SETTINGS)
                await waitDelay(500);
                MenuManager.GoTo(MENU_SINGLEPLAYER);
                console.log("📋 Changed Menu to " + MENU_SINGLEPLAYER)
                await waitDelay(500);
                MenuManager.GoTo(MENU_COMPLETE_SINGLEPLAYER);
                console.log("📋 Changed Menu to " + MENU_COMPLETE_SINGLEPLAYER)
                await waitDelay(500);
                MenuManager.GoTo(MENU_MAIN);
                console.log("📋 Changed Menu to " + MENU_MAIN)
                await waitDelay(500);

                console.log("📋 Menu Manager reports " + MenuManager.GetMenuID() + ", going back a menu.")
                if (MenuManager.GetMenuID() != MENU_MAIN) throw new Error('Menu Manager ID did not change');
                MenuManager.GoBack();
                await waitDelay(500);

                console.log("📋 Menu Manager reports " + MenuManager.GetMenuID() + ", going back a menu.")
                if (MenuManager.GetMenuID() != MENU_COMPLETE_SINGLEPLAYER) throw new Error('Menu Manager ID did not change');
                MenuManager.GoBack();
                await waitDelay(500);
                
                console.log("📋 Menu Manager reports " + MenuManager.GetMenuID() + ", going back a menu.")
                if (MenuManager.GetMenuID() != MENU_SINGLEPLAYER) throw new Error('Menu Manager ID did not change');
                MenuManager.GoBack();
                await waitDelay(500);
                
                console.log("📋 Menu Manager reports " + MenuManager.GetMenuID() + ", going back a menu.")
                if (MenuManager.GetMenuID() != MENU_SETTINGS) throw new Error('Menu Manager ID did not change');
                MenuManager.GoBack();
                await waitDelay(500);
                
                return 0;
            } catch (e) {
                return e;
            }
        }
    );

    // Test Menu ID's
    CreateTest("MENU_MAIN ID",
        "A test to ensure the MENU_MAIN is the main menu",
        async function () {
            try {
                MenuManager.GoTo(MENU_MAIN);
                console.log("📋 Changed Menu to " + MENU_MAIN)
                await waitDelay(1000);
                console.log("📋 Menu Manager reports " + MenuManager.GetMenuID());

                let inn = document.body.innerHTML;
                let condition = inn.includes(">Level Select<") && inn.includes(">Settings<") && inn.includes("<img class=\"hori\" src=\"/assets/game/game_logo.png\" alt=\"\">");
                if (!condition) throw new Error('Menu Manager did not load MENU_MAIN');

                return 0;
            } catch (e) {
                return e;
            }
        }
    );

    CreateTest("MENU_SETTINGS ID",
        "A test to ensure the MENU_MAIN is the main menu",
        async function () {
            try {
                MenuManager.GoTo(MENU_SETTINGS);
                console.log("📋 Changed Menu to " + MENU_SETTINGS)
                await waitDelay(1000);
                console.log("📋 Menu Manager reports " + MenuManager.GetMenuID());

                let inn = document.body.innerHTML;
                let condition = inn.includes("<input type=\"range\" id=\"gameVolume\"");
                if (!condition) throw new Error('Menu Manager did not load MENU_SETTINGS');

                return 0;
            } catch (e) {
                return e;
            }
        }
    );

    CreateTest("MENU_ABOUT ID",
        "A test to ensure the MENU_ABOUT is the main menu",
        async function () {
            try {
                MenuManager.GoTo(MENU_ABOUT);
                console.log("📋 Changed Menu to " + MENU_ABOUT)
                await waitDelay(1000);
                console.log("📋 Menu Manager reports " + MenuManager.GetMenuID());

                let inn = document.body.innerHTML;
                let condition = inn.includes("About Keyboard Hero");
                if (!condition) throw new Error('Menu Manager did not load MENU_ABOUT');

                return 0;
            } catch (e) {
                return e;
            }
        }
    );

    // Test the ability to play the game twice without reloading
    CreateTest("Multiple Game",
        "Tests the ability to play the game twice in a session",
        async function () {
            try {
                MenuManager.GoTo(MENU_MAIN);
                console.log("📋 Changed Menu to " + MENU_MAIN)
                await waitDelay(1000);
                MenuManager.GoTo(MENU_SINGLEPLAYER);
                console.log("📋 Changed Menu to " + MENU_SINGLEPLAYER)
                await waitDelay(2000);
                MenuManager.GoTo(MENU_MAIN);
                console.log("📋 Changed Menu to " + MENU_MAIN)
                await waitDelay(500);
                MenuManager.GoTo(MENU_SINGLEPLAYER);
                console.log("📋 Changed Menu to " + MENU_SINGLEPLAYER)
                await waitDelay(1000);

                console.log("📋 Get first game position reading")
                let firstReading = boards[0].CompletionPercentage();
                await waitDelay(1000);
                console.log("📋 Get second game position reading")
                let secondReading = boards[0].CompletionPercentage();



                if (firstReading>=secondReading) {
                    console.log("📋 First reading is later than or equal to second")
                    throw new Error("Game did not start correctly");
                }
                console.log("📋 First reading is an earlier time stamp than second")

                return 0;
            } catch (e) {
                return e;
            }
        }
    );

    // Test Settings
    CreateTest("Save Settings",
        "Tests the ability of the save file to save and load settings",
        async function () {
            try {
                console.log("📋 Saving original values")

                let originalGameVolumeState = Settings.GetKey(Setting_GameVolume)*100;
                let originalmenuVolumeState = Settings.GetKey(Setting_MenuVolume)*100;


                MenuManager.GoTo(MENU_SETTINGS);
                console.log("📋 Changed Menu to " + MENU_SETTINGS)
                await waitDelay(1000);
                console.log("📋 Setting Sliders")
                document.getElementById("gameVolume").value = 46;
                document.getElementById("menuVolume").value = 59;
                await waitDelay(1000);
                MenuManager.GoTo(MENU_MAIN);
                console.log("📋 Changed Menu to " + MENU_MAIN)
                await waitDelay(500);

                console.log("📋 Setting dummy values")
                Settings.SetKey(Setting_GameVolume,.21);
                Settings.SetKey(Setting_MenuVolume,.96);
                await waitDelay(500);

                console.log("📋 Loading settings file")
                LoadSettings();
                await waitDelay(1000);
                
                MenuManager.GoTo(MENU_SETTINGS);
                console.log("📋 Changed Menu to " + MENU_SETTINGS)
                await waitDelay(1000);
                
                console.log("📋 Reading Slider values")
                let gv = document.getElementById("gameVolume").value;
                let vm = document.getElementById("menuVolume").value;
                if (gv != 46) throw new Error("Game Volume Setting did not save propperly")
                if (vm != 59) throw new Error("Menu Volume Setting did not save propperly")

                await waitDelay(500);

                console.log("📋 Setting sliders to originals")
                document.getElementById("gameVolume").value = originalGameVolumeState;
                document.getElementById("menuVolume").value = originalmenuVolumeState;

                await waitDelay(500);

                MenuManager.GoTo(MENU_MAIN);
                console.log("📋 Changed Menu to " + MENU_MAIN)

                await waitDelay(500);

                console.log("📋 Checking value of originals in Settings File")
                if (Settings.GetKey(Setting_GameVolume)*100 != originalGameVolumeState) throw new Error("Game Volume Setting did not return propperly");
                if (Settings.GetKey(Setting_MenuVolume)*100 != originalmenuVolumeState) throw new Error("Menu Volume Setting did not return propperly");
                
                console.log("📋 Values returned normal")

                return 0;
            } catch (e) {
                return e;
            }
        }
    );

    // Test Input
    CreateTest("Test Input",
        "The the ability of the game to register keyboard inputs",
        async function () {
            try {
                MenuManager.GoTo(MENU_SINGLEPLAYER);
                console.log("📋 Changed Menu to " + MENU_SINGLEPLAYER)
                await waitDelay(250);   
                    
                for (let i = 0; i < boards[0].input_keys.length; ++i) {
                    // End if the game completes to avoid a softlock
                    while (boards[0].gameScore == 0 && !boards[0].gameComplete){
                        // Wait 10 miliseconds between attempted input to avoid crashing the browser
                        await waitDelay(10); 
                        boards[0].input[i] = 1;
                        // Force an update otherwise input isn't registered
                        boards[0].Update(boards[0].originX, boards[0].originY, boards[0].gameWidth, boards[0].gameHeight, boards[0].gameAudio);
                    }
                    // If the game completes it's assumed the tests failed
                    if (!boards[0].gameComplete){
                        console.log("✅ Lane " + (i+1) + " registered")
                        boards[0].gameScore = 0;
                    }else{
                        MenuManager.GoTo(MENU_MAIN);
                        return;
                    }
                }
                MenuManager.GoTo(MENU_MAIN);
                return 0;               
            } catch (e) {
                return e;
            }
        }
    );

    // Test Combo
    CreateTest("Test Combo",
        "The the ability of the game's combo system",
        async function () {
            try {
                // Ensure a restart
                await waitDelay(500); 
                MenuManager.GoTo(MENU_MAIN);
                // Start game
                MenuManager.GoTo(MENU_SINGLEPLAYER);
                console.log("📋 Changed Menu to " + MENU_SINGLEPLAYER)
                await waitDelay(250);   
                // Set debug flag
                boards[0].debugCombo = 1; 
                    // End if the game completes
                    while (!boards[0].gameComplete){
                        for (let i = 0; i < boards[0].input_keys.length; ++i) {
                            boards[0].input[i] = 1;
                            // Force an update otherwise input isn't registered
                            boards[0].Update(boards[0].originX, boards[0].originY, boards[0].gameWidth, boards[0].gameHeight, boards[0].gameAudio);
                            // Wait 5 miliseconds between attempted input to avoid crashing the browser 
                            await waitDelay(5); 
                        }
                    }
                // Reset debug flag
                boards[0].debugCombo = 0;

                if (boards[0].gameComboMultiplier > 100){
                    MenuManager.GoTo(MENU_MAIN);  
                    return 0; 
                }else{
                    MenuManager.GoTo(MENU_MAIN);  
                    return;
                }
                            
            } catch (e) {
                    return e;
            }
        }
    );

    RunTestTasks();
}
   
