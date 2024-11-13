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



class Multiplayer extends Menu {
    Open() {
        socket.emit("registerMultiplayer");
        this.faileTime = 0;
    }
    Update() {
        this.faileTime += deltaTime/1000;
        if (this.faileTime > 15) {
            MenuManager.GoBack();
            GameMessage("Failed to connect to server");
        }
    }
    Render() {
        fill(255);
        textAlign(CENTER,CENTER)
        textSize(32);
        text("Connecting to the server",0,0);
    }
    Leave() {
        
    }
}
class MultiplayerSetup extends Menu {
    Open() {
        $.get("/assets/game/keyboardhero/menu/multiplayer/setup.html", function( data ) {
            $( "#multiplayerSetupMenuContainer" ).append( data );
            document.getElementById('multiplayerSetupMenu').style.display = 'block';
        });
    }
    Leave() {
        $( "#multiplayerSetupMenuContainer" ).remove();
        $( "#multiplayerSetupMenu" ).append("<div id=\"multiplayerSetupMenuContainer\"></div>");
        document.getElementById('multiplayerSetupMenu').style.display = 'none';
    }
}
class MultiplayerHost extends Menu {
    Open() {
        $.get("/assets/game/keyboardhero/menu/multiplayer/host.html", function( data ) {
            $( "#multiplayerHostMenuContainer" ).append( data );
            document.getElementById('multiplayerHostMenu').style.display = 'block';
        });
    }
    Leave() {
        $( "#multiplayerHostMenuContainer" ).remove();
        $( "#multiplayerHostMenu" ).append("<div id=\"multiplayerHostMenuContainer\"></div>");
        document.getElementById('multiplayerHostMenu').style.display = 'none';
    }
}
class MultiplayerJoin extends Menu {
    Open() {
        $.get("/assets/game/keyboardhero/menu/multiplayer/join.html", function( data ) {
            $( "#multiplayerJoinMenuContainer" ).append( data );
            document.getElementById('multiplayerJoinMenu').style.display = 'block';
        });
    }
    Leave() {
        $( "#multiplayerJoinMenuContainer" ).remove();
        $( "#multiplayerJoinMenu" ).append("<div id=\"multiplayerJoinMenuContainer\"></div>");
        document.getElementById('multiplayerJoinMenu').style.display = 'none';
    }
}
class MultiplayerGame extends Menu {
    Open() {
        
    }
    Leave() {
        
    }
}