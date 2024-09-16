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



class MainMenu extends Menu {
    Open() {
        $.get("/assets/game/menus/home.html", function( data ) {
            $( "#homeMenuContainer" ).append( data );
            document.getElementById('homeMenu').style.display = 'block';
        });
    }
    Leave() {
        $( "#homeMenuContainer" ).remove();
        $( "#homeMenu" ).append("<div id=\"homeMenuContainer\"></div>");
        document.getElementById('homeMenu').style.display = 'none';
    }
}

class DiffSelectMenu extends Menu {
    Open() {
        console.log("DiffSelect Menu Opend");
    }
    Leave() {
        console.log("Left the DiffSelect Menu");
    }
}

class SettingsMenu extends Menu {
    Open() {
        $.get("/assets/game/menus/settings.html", function( data ) {
            $( "#settingsMenuContainer" ).append( data );
            document.getElementById('settingsMenu').style.display = 'block';
        });
    }
    Leave() {
        $( "#settingsMenuContainer" ).remove();
        $( "#settingsMenu" ).append("<div id=\"settingsMenuContainer\"></div>");
        document.getElementById('settingsMenu').style.display = 'none';
    }
}