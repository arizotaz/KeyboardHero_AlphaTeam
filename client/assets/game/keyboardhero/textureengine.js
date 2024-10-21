//########################################################
//# TextureEngine.js is a simple texture managing script.
//# It is designed to only load the textures that the
//# game needs to save on bandwith and memory.  Its not
//# a nessecity, but is nice to have when the game becomes
//# bigger.
//# 

/* List of textures available to p5js */
let textures = [
    { id: "game_background" , url: "/assets/game/keyboardhero/textures/game_background.png" },
    { id: "button_base"     , url: "/assets/game/keyboardhero/textures/button_base.png"     },
    { id: "button_top"      , url: "/assets/game/keyboardhero/textures/button_topper.png"   },
    { id: "score_perfect"   , url: "/assets/game/keyboardhero/textures/score_perfect.png"   },
    { id: "score_great"     , url: "/assets/game/keyboardhero/textures/score_great.png"     },
    { id: "score_good"      , url: "/assets/game/keyboardhero/textures/score_good.png"      },
    { id: "score_ok"        , url: "/assets/game/keyboardhero/textures/score_ok.png"        },
    { id: "score_miss"      , url: "/assets/game/keyboardhero/textures/score_miss.png"      },
    
];



// List of ID's that are loading
// Ex "tex1","tex2","tex3"
var loadingList = [];
// List and image object list
// Ex {id:"tex1",img:(IMAGE)},{id:"tex2",img:(IMAGE)}
var loadedTextures = [];

// Is the ID in the list "textures"
function TextureInList(id) {
    let result = false;
    for (let e in textures) {
        if (textures[e].id == id) {
            result = true;
        }
    }
    return result;
}

// Is the texture currently loading
function TextureIsLoading(id) {
    let result = false;
    for (let i = 0; i < loadingList.length; ++i)
        if (loadingList[i] == id) result = true;
    return result;
}

// Is the texture loaded
function TextureLoaded(id) {
    let result = false;

    for (let e in loadedTextures) {
        if (loadedTextures[e].id == id && loadedTextures[e].img != null) {
            result = true;
        }
    }

    return result;
}

// Load the texture
function LoadTexture(id) {
    let textureEntry;
    for (let e in textures) {
        if (textures[e].id == id) {
            textureEntry = textures[e];
        }
    }

    loadingList.push(id);

    var obj = {};
    obj.id = id;
    obj.img = null;
    obj.loaded = false;

    obj.img = loadImage(textureEntry.url, img => {
        console.log("loaded texture - " + id);
        for (let i = 0; i < loadingList.length; ++i) {
            if (loadingList[i] == id) {
                loadingList.splice(i,1);
            }
        }
    }, img => {
        obj.img = _errtex;
        console.warn("failed to load texture - " + id);
        for (let i = 0; i < loadingList.length; ++i) {
            if (loadingList[i] == id) {
                loadingList.splice(i,1);
            }
        }
    });

    loadedTextures[id] = (obj);

    
}

// Returns what to draw to the screen based on texture status
function GetTexture(id) {
    // If the image is not in the roster, return error texture
    if (!TextureInList(id)) return _errtex;
    if (TextureIsLoading(id)) return _texLoading;
    if (!TextureLoaded(id)) { LoadTexture(id); return _errtex; }
    return loadedTextures[id].img;
}

// Returns the texture id of the background of theme [themeID]
function ThemeBackground    (themeID)       { return "theme_"+themeID+"_background"; }

// Returns the lane key down texture id of lane [lane] in theme [themeID]
function ThemeLaneKeyDown   (themeID,lane)  { return "theme_"+themeID+"_lane_"+lane+"_key_down"; }
// Returns the lane key up texture id of lane [lane] in theme [themeID]
function ThemeLaneKeyUp     (themeID,lane)  { return "theme_"+themeID+"_lane_"+lane+"_key_up"; }

// Returns the lane background down texture id of lane [lane] in theme [themeID]
function ThemeLaneBGDown    (themeID,lane)  { return "theme_"+themeID+"_lane_"+lane+"_bg_down"; }
// Returns the lane background up texture id of lane [lane] in theme [themeID]
function ThemeLaneBGUp      (themeID,lane)  { return "theme_"+themeID+"_lane_"+lane+"_bg_up"; }

// Returns the texture id of the tile of theme [themeID]
function ThemeTile          (themeID)       { return "theme_"+themeID+"_tile"; }

function ThemeProgressFill  (themeID)       { return "theme_"+themeID+"_progress_fill"; }
function ThemeProgressFillB (themeID)       { return "theme_"+themeID+"_progress_fill_start"; }
function ThemeProgressFillE (themeID)       { return "theme_"+themeID+"_progress_fill_end"; }

function ThemeProgressBG    (themeID)       { return "theme_"+themeID+"_progress_container"; }
function ThemeProgressBGB   (themeID)       { return "theme_"+themeID+"_progress_container_start"; }
function ThemeProgressBGE   (themeID)       { return "theme_"+themeID+"_progress_container_end"; }


// Creates entries for [themeID]
function LoadTheme(themeID) {
    AddTextureID(ThemeBackground(themeID));

    for (let i = 0; i < 4; ++i) {
        AddTextureID(ThemeLaneKeyDown(themeID,i));
        AddTextureID(ThemeLaneKeyUp(themeID,i));
        AddTextureID(ThemeLaneBGDown(themeID,i));
        AddTextureID(ThemeLaneBGUp(themeID,i));
    }

    AddTextureID(ThemeTile(themeID));

    AddTextureID(ThemeProgressFill(themeID));
    AddTextureID(ThemeProgressFillB(themeID));
    AddTextureID(ThemeProgressFillE(themeID));
    AddTextureID(ThemeProgressBG(themeID));
    AddTextureID(ThemeProgressBGB(themeID));
    AddTextureID(ThemeProgressBGE(themeID));    
}

// Removes texture
function RemTextureID(tid) {
    for (let i = textures.length-1; i >= 0; --i)
        if (textures[i].id == tid)
            textures.splice(i,1);
    delete loadedTextures[tid];
}

// Adds texture
function AddTextureID(tid) {
    let li = { id: tid, url: "/assets/game/keyboardhero/textures/"+tid+".png"};
    RemTextureID(tid);
    textures.push(li);
}

// Load theme 0 as default
LoadTheme(0);