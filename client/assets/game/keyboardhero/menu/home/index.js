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
        if (!Settings.GetKey(Setting_AuCalCompleted)) {
            MenuManager.GoTo(MENU_AUDIOCALI);
            return;
        }
        $.get("/assets/game/keyboardhero/menu/home/index.html", function( data ) {
            $( "#homeMenuContainer" ).append( data );
            document.getElementById('homeMenu').style.display = 'block';
            socket.emit("requestClients")
        });
    }
    Leave() {
        $( "#homeMenuContainer" ).remove();
        $( "#homeMenu" ).append("<div id=\"homeMenuContainer\"></div>");
        document.getElementById('homeMenu').style.display = 'none';
    }
}