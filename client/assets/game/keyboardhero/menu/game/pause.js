class GamePauseMenu extends Menu {
    Open() {
        $.get("/assets/game/keyboardhero/menu/game/pause.html", function (data) {
            $("#gameMenuContainer").append(data);
            document.getElementById('gameMenu').style.display = 'block';
        });
    }
    Leave() {
        $("#gameMenuContainer").remove();
        $("#gameMenu").append("<div id=\"gameMenuContainer\"></div>");
        document.getElementById('gameMenu').style.display = 'none';
    }
}