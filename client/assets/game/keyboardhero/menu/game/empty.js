class GameViewMenu extends Menu {
    Open() {
        let img = document.createElement('img');
        img.src = "/assets/game/keyboardhero/textures/pause.png";
        img.id = "gamePauseButton";
        img.onclick = () => { MenuManager.GetMenu(MENU_SINGLEPLAYER).gameMenuManager.GoTo(1); gameAudio.pause(); }
        document.body.appendChild(img);
    }
    Leave() {
        document.getElementById("gamePauseButton").remove();
    }
}

class GameTempMenu extends Menu {
    Open() {

    }
    Update() {
        if (boards[0].StartCountdown() < 0) {
            MenuManager.GetMenu(MENU_SINGLEPLAYER).gameMenuManager.GoTo(0);
        }
    }
    Render() {

    }
    Leave() {

    }
}