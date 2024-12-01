class GameSettingsMenu extends Menu {
    Open() {
        $.get("/assets/game/keyboardhero/menu/settings/index.html", function (data) {
            $("#gameMenuContainer").append(data);
            document.getElementById('gameMenu').style.display = 'block';

            document.getElementById('gameVolume').value = Settings.GetKey(Setting_GameVolume) * 100;
            document.getElementById('menuVolume').value = Settings.GetKey(Setting_MenuVolume) * 100;
            document.getElementById('columnWidth').value = 4;
            LoadKeysToControlChanger(4);

            document.getElementById("settings_BackMenu").onclick = () => { MenuManager.GetMenu(MENU_SINGLEPLAYER).gameMenuManager.GoBack(); }
            document.getElementById("settings_ToAC").onclick = () => { MenuManager.GetMenu(MENU_SINGLEPLAYER).gameMenuManager.GoTo(3); }
            document.getElementById("settings_save").onclick = () => { SaveSettingsMenuChanges(); MenuManager.GetMenu(MENU_SINGLEPLAYER).gameMenuManager.GoBack(); }

        });
    }
    Leave() {
        menuAudio.volume = Settings.GetKey(Setting_MenuVolume);
        gameAudio.volume = Settings.GetKey(Setting_GameVolume);

        $("#gameMenuContainer").remove();
        $("#gameMenu").append("<div id=\"gameMenuContainer\"></div>");
        document.getElementById('gameMenu').style.display = 'none';
    }
}