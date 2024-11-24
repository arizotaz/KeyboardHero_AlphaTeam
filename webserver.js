/*   Require Packages from Node JS   */
// Web Server Wrapper
console.log("Loading Express");
var express = require('express');
// Web Server Wrapper Object
console.log("Getting Express");
var app = express();
// HTTP Server
console.log("Http Server");
var serv = require('http').Server(app);
// Cors access policy
console.log("Loading Cores");
var cors = require('cors');
// Allow execution of binaries on the server
console.log("Loading Child Process");
const { exec } = require("child_process");
// File System Library
console.log("Loading FS");
const fs = require('fs');
// database functions
console.log("Loading database.js");
const { getSongScores } = require('./database.js');
// Socket IO
console.log("Loading Socket.IO");
let io = require('socket.io')(serv, {});


// The cmd to start python
// change file python.conf
let pythonBinary = "python";



// Storage & Upload
const tempFileUploads = __dirname + '/tempSongUploads/'
if (fs.existsSync(tempFileUploads)) fs.rmSync(tempFileUploads, { recursive: true, force: true });
if (!fs.existsSync(tempFileUploads)) fs.mkdirSync(tempFileUploads);
// multer for file uploads
const multer = require('multer');
// require for running python processing script
const { spawn } = require("child_process");
const { log } = require('console');

//storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempFileUploads); // folder to hold mp3s
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // ensures use of original file name
    }
});

// create multer object
const upload = multer({ storage: storage });



// Web Server Port
var port = 32787;
if (fs.existsSync(__dirname + "/port.txt")) port = parseInt(fs.readFileSync(__dirname + "/port.txt"));


// Python CMD
if (!fs.existsSync(__dirname + "/python.conf")) fs.writeFileSync(__dirname + "/python.conf", "python")
if (fs.existsSync(__dirname + "/python.conf")) pythonBinary = (fs.readFileSync(__dirname + "/python.conf", "utf8")).replaceAll("\n", "");


// Sets the Cors access policy
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// The root index file
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

// Allow a folder to be viewed in the web-server
// All files in the "/client/assets" folder will be vieable to the client
app.use('/assets', express.static(__dirname + '/client/assets'));

app.get('/assets/socket.io/socket.io.js', function (req, res) {
    let socketioclient = __dirname + "/node_modules/socket.io/client-dist/socket.io.js";
    res.sendFile(socketioclient);
});
app.get('/levelselect/songs/', function (req, res) {
    let socketioclient = __dirname + "/songlist.json";
    res.sendFile(socketioclient);
});
app.get('/levelselect/songs/', function (req, res) {
    let socketioclient = __dirname + "/songlist.json";
    res.sendFile(socketioclient);
});


//api to get scores using for testing
app.get("/api/scores/:song_id", async (req, res) => {
    try {
        const song_id = req.params.song_id;
        const scores = await getSongScores(song_id);
        res.json(scores);
    } catch (err) {
        res.status(500).send("Error fetching scores");
    }
});

// upload new score to scoreboard
app.post('/submitScore', (rep, res) => {
    const {user_id, song_id, score } = req.body;
    if (!user_id || !song_id ||typeof score !== 'number') {
        return res.status(400).json({error: 'Invalid input'});
    }

    //check to see if a score already exists for that song an the user
    const checkQuery = 'SELECT score from scores WHERE user_id = ? AND song_id = ?;';

    db.query(checkQuery, [user_id, song_id], (err, results) => {
        if(err) {
            console.error('Database error:', err);
            return res.status(500).json({error: 'Database error'});
        }

        //if there is a existing score compare to new score
        if (results.length > 0) {
            const existingScore = results[0].score;
            
            //update score if new score is higher
            if(score > existingScore) {
                const updateuery = 'UPDATE scores SET score = ? WHERE user_id = ? AND song_id = ?;';

                db.query(updateQuery, [score, user_id, song_id], (err)=> {
                    if(err) {
                        console.error('Database error:' , err);
                        return res.status (500).json({error: 'Database error'});
                    }

                    return res.status(200).json({message: 'High score updated!'});
                }); 
            } else {
                //score to low will not update
                return res.status(200).json({messsage: 'Score not high enough, will not be updated.'});
            }
        } else {
            //no score for that song and user, adds score
            const insertQuery = 'INSERT INTO scores (user_id, song_id, score) VALUES(?, ?, ?);';

            db.query(insertQuery, [user_id, song_id, score], (err)=> {
                if(err) {
                    console.error('Database error:' , err);
                    return res.status (500).json({error: 'Database error'});
                }

                return res.status(200).json({message: 'High score added!'});
            }); 
        }
    });
});

// upload and process files
app.post('/newSongUpload', upload.single('file'), (req, res) => {
    // The id of the user selected theme
    const theme = req.body.theme;

    // The user selected difficulty level
    const difficulty = req.body.difficulty;

    // location of where levels are stored
    const levelLocation = tempFileUploads;

    const songFilePath = levelLocation + req.file.originalname; // final mp3 file path
    const songName = req.file.originalname.replaceAll(".mp3", ""); // original mp3 name

    const JSONFilePath = levelLocation + songName + ".json";

    // launch python process with song file path and original mp3 name
    const pythonProcess = spawn(pythonBinary, [__dirname + "/beatmapGenerator.py", songFilePath, songName, difficulty, theme]);

    // delete original mp3 when python process closes
    pythonProcess.on('close', (code) => {
        if (fs.existsSync(JSONFilePath)) res.send(fs.readFileSync(JSONFilePath, "utf8")); else res.send("File did not convert propperly");
        if (fs.existsSync(songFilePath)) fs.unlink(songFilePath, (err) => {
            if (err) {
                console.error('ORIGINAL MP3 DELETION ERROR:', err);
            } else {
                console.log('MP3 DELETED SUCCESSFULLY.');
            }
        });
        if (fs.existsSync(JSONFilePath)) fs.unlink(JSONFilePath, (err) => {
            if (err) {
                console.error('COVERTED MP3 DELETION ERROR:', err);
            } else {
                console.log('MP3 COVERT SUCCESSFULLY.');
            }
        });
    })
    // send info back to webpage

});



// 404 Status page
app.get('*', function (req, res) {
    res.status(404).sendFile(__dirname + '/404.html');
});

// start the server
serv.listen(port);
console.log(`Server started on: http://localhost:${port}`);

// Login system 

// Needed to parse inputs for account creation
var bodyParser = require('body-parser'); 
app.use(bodyParser.urlencoded({ extended: false }));

// Cookies for accounts
var cookieParser = require('cookie-parser');
app.use(cookieParser());

// Process account creation

const { createAccount } = require('./database.js');

const { usernameAvailable } = require('./database.js');

const { usernameAvailable } = require('./database.js');

app.post('/createAccount', async function(req, res){

    try {
    var bcrypt = require('bcryptjs');
    var hash = bcrypt.hashSync(req.body.password, 10);

    //console.log("Username : " + req.body.username);
    //console.log("Email : " + req.body.email);
    //console.log("Hashed & salted password : " + hash);

    var username = await usernameAvailable(req.body.username);

    if (username){
        // Make users account
        var newSessionId = Math.floor(Math.random() * 999999999);
        var sessionID = bcrypt.hashSync(newSessionId.toString(), 5);
    var username = await usernameAvailable(req.body.username);

    if (username){
        // Make users account
        var newSessionId = Math.floor(Math.random() * 999999999);
        var sessionID = bcrypt.hashSync(newSessionId.toString(), 5);

        var time = Date.now();
        var userID = await createAccount(req.body.username,req.body.email,hash, time, sessionID);
        if (userID){
            res.cookie('userID', userID);
            res.cookie('sessionID', sessionID);
        }else{
            // failed for unknown reason
            console.error('Failed to create account.', err);
        }
        
    }else{
        console.error('Username already in use.', err);
    }
    res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error making account' });
    }

    
});

// login system
const { login } = require('./database.js');
const { createSession } = require('./database.js');

app.post('/login', async function(req, res){
    try {
        var data = await login(req.body.username);
        var bcrypt = require('bcryptjs');
        userID = data[0];
        hash = data[1];

        //console.log(data[0]);
        //console.log(data[1]);
        //console.log(data[0]);
        //console.log(data[1]);

        if(bcrypt.compareSync(req.body.password, hash)){
            var newSessionId = Math.floor(Math.random() * 999999999);
            var sessionID = bcrypt.hashSync(newSessionId.toString(), 5);
            var time = Date.now();
            createSession(userID, sessionID, time);

            res.cookie('userID', userID);
            res.cookie('sessionID', sessionID);
        }else{
            console.error('Incorrect username or password.', err);
        }else{
            console.error('Incorrect username or password.', err);
        }

        res.redirect('/');
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to log in' });
        }
});

// Clear current login info
app.post('/logout', function(req, res){
    res.clearCookie('userID');
    res.clearCookie('sessionID');
    res.redirect('/');
});

const { getUserData } = require('./database.js');

// Get user data for statistics
app.post('/verifyuser', async function(req, res){
    try {
        var userData = await getUserData(req.cookies.userID, req.cookies.sessionID);

        if (req.cookies.sessionID == userData.session_id){
            res.json(userData); 
        }else{
            res.clearCookie('userID');
            res.clearCookie('sessionID');
            console.error('Tokens do not match.', err);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching user data' });
    }
});

// Below will be the code for multiplayer and score system. 

let clients = [];
function NumOfClients() {
    let n = 0;
    for (let i in clients) ++n;
    return n;
}

io.sockets.on('connection', function (socket) {
    try {
        socket.emit("handshake");
        clients[socket.id] = new GameClient(socket);
        console.log(socket.id + " Connected")
        socket.on('disconnect', function (data) {
            console.log(socket.id + " Disconnected")
            delete clients[socket.id];
        });
        io.emit("clients", { clients: NumOfClients() });
        socket.on("requestClients", function () { try { socket.emit("clients", { clients: NumOfClients() }); } catch (e) { console.error(e) } });
        socket.on("currentMenu", function (data) { try { clients[socket.id].SetCurrentMenu(data.id) } catch (e) { console.error(e) } });

        socket.on("requestMultiplayer",(data) => { clients[socket.id].RegisterMultiplayer(); });


        socket.on("ping", function() { socket.emit("pong", { msg:"Ping return"}); console.log(socket.id + " pinged the server"); })
    } catch (e) { console.error(e); }

});






class GameClient {
    constructor(socket) {
        this.socket = socket;
        this.id = socket.id;
        this.username = "User" + Math.round(Math.random() * 10000);
        this.currentMenu = 0;
        this.roomID = "";
    }
    SetCurrentMenu(id) {
        if (id == null) throw new Error("id is null");
        this.currentMenu = id;
    }
}
