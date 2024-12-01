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



class GameAudioCalibration extends Menu {
    Open() {
        this.mode = 1;
        this.audio = new Audio("/assets/game/keyboardhero/sounds/audio_cal_ping.mp3");
        this.timer = 1.5;
        this.vtimer = -1;
        this.offset = Settings.GetKey(Setting_AuCalibration);
    }
    Update() {

        if (this.mode == 1) {

            if (keyIsDown(38) && !this.keyOneShot) { this.offset += 10; this.keyOneShot = true; this.vtimer = 0; }
            if (keyIsDown(40) && !this.keyOneShot) { this.offset -= 10; this.keyOneShot = true; this.vtimer = 0; }
            if (!keyIsDown(38) && !keyIsDown(40)) { this.keyOneShot = false; }

            if (this.timer <= 0) {
                this.timer += 2;
                this.audio.currentTime = 0;
                this.audio.play();
            }
            if (this.vtimer <= 0) {
                this.vtimer = this.timer + this.offset/1000;
            }
            let dt = deltaTime / 1000;
            this.timer -= dt;
            this.vtimer-= dt;

            if (keyIsDown(32) && !this.keyOneShot) { 
                this.keyOneShot = true;
                Settings.SetKey(Setting_AuCalibration,this.offset);
                Settings.SetKey(Setting_AuCalCompleted,true);
                SaveSettings();
                MenuManager.GetMenu(MENU_SINGLEPLAYER).gameMenuManager.GoBack();
            }

            //this.vtimer = this.timer + this.offset / 1000;
        }

    }
    Render() {
        if (this.mode == 0) {
            fill(255);
            textSize(24);
            textAlign(CENTER, CENTER);
            text("Press Any Key to start", 0, 0);
            return;
        }
        if (this.mode == 1) {
            let sep = 2;
            let barW = 800, barH = 100;
            let counterW = 5;
            fill(255);
            rect(0, 0, barW, barH);

            rect(0,-barH/2-(counterW*2)-barH/2*(this.vtimer/2), counterW*2, counterW*2);
            rect(0, barH/2+(counterW*2)+barH/2*(this.vtimer/2), counterW*2, counterW*2);

            fill(255, 240, 240);
            rect(0, 0, counterW, barH);
            fill(0);
            for (let i = -1; i <= 0; ++i) {
                rect(barW / sep * (this.vtimer / sep) + barW / sep * i, 0, counterW, barH);
            }

            fill(255);
            textSize(24);
            textAlign(CENTER, CENTER);
            let prefix = "";
            if (this.offset > 0) { prefix = "+"; }
            text(prefix + (this.offset) + "ms", 0, -100);

            fill(255);
            textSize(24);
            textAlign(CENTER, TOP);
            let tw = windowWidth;
            if (tw>800) tw = 800;
            text("Use the arrow keys to adjust the offset in Miliseconds.\nMake sure the tone lines up with the center line.\nPress space when done.", 0, 100, tw);

            return;
        }

    }
    Leave() {

    }
}