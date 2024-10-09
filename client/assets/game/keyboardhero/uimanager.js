//########################################################
//# The UIManager manages the changing of scenes in the
//# game.  Each menu should be it's own "scene".  The main
//# game should also see it's own scene.  When a scene is
//# not active, it is not processed or looked at.
//########################################################
//# To use the manager, add a menu using
//#    MenuManager.AddMenu(index,menu)
//# where index is the id of the menu and menu is a class
//# that implements Menu.
//# You can then use 
//#     MenuManager.GoTo(index)
//# to show the menu. Where index is the id of the menu.


// Manages menus and their change
class UIManager {
    constructor(defaultMenu) {
        this.changeToMenu = defaultMenu;
        this.currentMenu = defaultMenu;
        this.lastMenu = -1;
        this.menus = [];
        this.history = [];
    }

    // Adds the menu to the list, at a specific index
    AddMenu(index,menu) { this.menus[index] = menu; }


    /*Called every frame, calls Open when a menu opens, leave when you
    leave that screen and update on every frame of the current menu
    */
    Update() {
        this.currentMenu = this.changeToMenu;

        if (this.currentMenu !== this.lastMenu) {
            if (this.menus[this.lastMenu] != null) {this.menus[this.lastMenu].Leave();}
            this.lastMenu = this.currentMenu;
            this.menus[this.currentMenu].Open();
        }
        
        this.menus[this.currentMenu].Update();
    }
    // Calls the render function of the current menu
    Render() { this.menus[this.currentMenu].Render(); }

    // Goes to a menu
    GoTo(index) {
        this.history.unshift(this.currentMenu);
        this.GoToNoHistory(index);
    }
    // Goes to a menu but does not add it to history
    GoToNoHistory(index) {
        this.changeToMenu = index;
    }
    // Goes to the last menu in the history if available
    GoBack() {
        if (this.history[0] == null) return;
        this.currentMenu = this.history[0];
        this.history.splice(0,1);
    }

    // Returns the current menu ID
    GetMenuID() { return this.currentMenu; }

    // Returns the current menu object
    GetMenu() { return this.menus[this.currentMenu]; }

}

// Menu Base Class
class Menu {
    constructor() {}
    // Called when menu is switched too
    Open() {}
    // Called every frame - indended for logic
    Update(){}
    // Called every frame - indended for Drawing
    Render(){}
    // Called when the menu is moved away from
    Leave(){}
}