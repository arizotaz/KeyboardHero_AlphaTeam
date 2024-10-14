//########################################################
//# The book.js file acts as the main entry point of the
//# game.  This file allows a lot of comfort features to
//# be implemented game wide.  
//########################################################
//# Boot.js manages the runtime of the game, p5js settings,
//# error handling, and window-resizing.  We could also
//# add a boot logo to the game if desired.

// Capture Page Errors
window.onerror = function(error, url, line) {
    ThrowError(new Error(error, url, line));
};

// Disables the right click menu
document.addEventListener('contextmenu', function (e) { e.preventDefault(); });

// #NFP Needed for production
//p5.disableFriendlyErrors = true;


// Enable Boot Animation, false = enabled, true = disabled
var _afterBoot = true;

// Resize canvas when the browser size is changed
let allowCanvasResize = true;
let lastCanvasWidth = 0;
let lastCanvasHeight = 0;
let running = _afterBoot;
let merror = null;

// Shows the banner at the top of the screen
function EngineBanner(b) { 
    let engineBanner = document.getElementById("EngineBanner");
    if (b == null || b == "") if (engineBanner != null) { engineBanner.remove(); return; }

    if (engineBanner == null && b != null && b != "") {
        engineBanner = document.createElement("div");
        engineBanner.id = "EngineBanner";
        document.body.append(engineBanner)
    }
    engineBanner.innerHTML = b;

}

// p5js start function, called once at start
function setup() {
    // Create the canvas
    createCanvas(windowWidth, windowHeight);
    // Set other render parm 
    rectMode(CENTER);
    imageMode(CENTER);
    ellipseMode(CENTER);
    angleMode(DEGREES);
    noStroke();
    noSmooth();
}


// P5js Loop function, called every frame
function draw() {
    // if the size changes, resize the canvas and alert that the size has changed
    if ((width != windowWidth || height != windowHeight) && allowCanvasResize) {
        resizeCanvas(windowWidth, windowHeight, false);
        lastWidth = width;
        lastHeight = height;

        // Call OnWindowResize if it exists
        if (typeof OnWindowResize === "function") OnWindowResize();
    }
    translate(windowWidth / 2, windowHeight / 2);

    // main loop
    if (running) {
        try {
            ApplicationMain();
            if (merror != null) throw merror;
        } catch (error) {
            fill(0);
            rect(20, 20, 400, 200);
            fill(0, 0, 255);
            rect(0, 0, 400, 200);
            fill(255);
            textAlign(CENTER, CENTER);
            text(error, 0, 0, 350, 150);

            let elms = document.body.childNodes;
            for (let i = elms.length-1; i >=0 ; --i) {
                if (elms[i].tagName != 'MAIN') {
                    elms[i].remove();
                }
            }

            console.log(error.stack);
            running = false;

           

            //crashLog(error.stack);
        }
    } else {
        if (!_afterBoot) {
            frameRate(30);
            bootAnimation();
            _time++;
            background(0, 0, 0, _fade);
            if (_fade >= 255) {
                running = true;
                _afterBoot = true;
            }
        }
    }
}

// Throws and error in the main loop from outside the loop
function ThrowError (e) {
    merror = e;
}


var _sfd;
var _time = 0;
var _fade = 0;
function preload() {
    if (typeof ApplicationPreload === "function") ApplicationPreload();
    _sfd = loadImage("/assets/game/team_logo.png");
    _errtex = loadImage("/assets/game/error.png");
    _texLoading = loadImage("/assets/game/loading.png");
}
function bootAnimation() {
    background(0, 0, 35, 25);
    var fireFly = {
        locationX: random(width)-width/2,
        locationY: random(height)-height/2,
        size: random(1, 10)
    }
    fill(244, 233, 140, 100);
    ellipse(fireFly.locationX, fireFly.locationY, fireFly.size + 10, fireFly.size + 10);
    fill(244, 233, 140);
    ellipse(fireFly.locationX, fireFly.locationY, fireFly.size, fireFly.size);

    var size = width - 20
    if (size > 800) {
        size = 800;
    }
    image(_sfd, 0, 0, size, size / 8 * 2);

    if (_time / 30 > 1) {
        _fade += 8;
    }
}