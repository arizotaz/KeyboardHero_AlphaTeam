//########################################################
//# This file contains the structures for the menus.
//# These classes act as translations to control the html
//# content is an easy way
//########################################################
//# Each structure is pretty simple, when a menu is to be
//# shown, the Open function is called.  When a menu is
//# change, the Leave function is called on the previous
//# menu and the Open function is called on the new menu.
//# 
//# Update and Render are called on every frame of the
//# game.  They may not be used for the HTML pages, but
//# are used by the game it self.



class SettingsMenu extends Menu {
    Open() {
        $.get("/assets/game/keyboardhero/menu/settings/index.html", function (data) {
            $("#settingsMenuContainer").append(data);
            document.getElementById('settingsMenu').style.display = 'block';

            document.getElementById('gameVolume').value = Settings.GetKey(Setting_GameVolume) * 100;
            document.getElementById('menuVolume').value = Settings.GetKey(Setting_MenuVolume) * 100;
            document.getElementById('columnWidth').value = 4;
            LoadKeysToControlChanger(4);

            document.getElementById("settings_BackMenu").onclick = () => { MenuManager.GoBack(); }
            document.getElementById("settings_ToAC").onclick = () => { MenuManager.GoTo(MENU_AUDIOCALI); }
            document.getElementById("settings_save").onclick = () => { SaveSettingsMenuChanges(); MenuManager.GoBack(); }

        });
    }
    Leave() {
        menuAudio.volume = Settings.GetKey(Setting_MenuVolume);

        $("#settingsMenuContainer").remove();
        $("#settingsMenu").append("<div id=\"settingsMenuContainer\"></div>");
        document.getElementById('settingsMenu').style.display = 'none';
    }
}