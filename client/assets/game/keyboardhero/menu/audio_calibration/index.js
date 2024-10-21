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



class AudioCalibrationMenu extends Menu {
    Open() {
        $.get("/assets/game/keyboardhero/menu/audio_calibration/index.html", function( data ) {
            $( "#acMenuContainer" ).append( data );
            document.getElementById('acMenu').style.display = 'block';
        });
    }
    Update() {

    }
    Render() {
        
    }
    Leave() {
        $( "#acMenuContainer" ).remove();
        $( "#acMenu" ).append("<div id=\"acMenuContainer\"></div>");
        document.getElementById('acMenu').style.display = 'none';
    }
}