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

