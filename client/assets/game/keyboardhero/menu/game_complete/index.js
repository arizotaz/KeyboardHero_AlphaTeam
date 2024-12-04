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



class GameCompletedMenu extends Menu {
    Open() {
            
        $.get("/assets/game/keyboardhero/menu/game_complete/index.html", function( data ) {
            $( "#gameCompletedMenuContainer" ).append( data );
            document.getElementById('gameCompletedMenu').style.display = 'block';
            GatherDataForGameCompletedMenu();
            submitAndDisplayScores();
            fetchAndDisplayScores();
        });
    }
    Leave() {
        $( "#gameCompletedMenuContainer" ).remove();
        $( "#gameCompletedMenu" ).append("<div id=\"gameCompletedMenuContainer\"></div>");
        document.getElementById('gameCompletedMenu').style.display = 'none';
    }
}