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
const { submitScore } = require('./database.js');
const { displayScores } = require('./database.js');
const { sortHighToLow } = require('./database.js');
const { removeScore } = require('./database.js');
const { getSortedScoresWithRank } = require('./database.js');
const db = require('./database');




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

app.get('/levelselect/songs/', function (req, res) {
    let socketioclient = __dirname + "/songlist.json";
    res.sendFile(socketioclient);
});


//api to get scores using for testing
app.get('/scores', async (req, res) => {
    try {
        const scores = await getScores(); // Call the async function to get scores
        res.json(scores); // Send the scores as JSON to the client
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching scores' });
    }
});

app.use(express.json());

app.post('/submitScore', async (req, res) => {
    try {
        const { score, user_id, song_id } = req.body;
        console.log("Received score submission:", { score, user_id, song_id });

        if (user_id === undefined || user_id === '') {
            return res.status(200).json({ message: 'No user score was not added.' });
        }

        if (!user_id || !song_id || typeof score !== 'number') {
            return res.status(400).json({ error: 'Invalid input' });
        }



        const results = await db.getSongScores(song_id);
        console.log("Existing scores for the song:", results);  // Log the existing scores

        const existingScoreEntry = results.find(entry => entry.user_id === Number(user_id));
        console.log(existingScoreEntry);
        if (existingScoreEntry) {
            const existingScore = existingScoreEntry.score;
            console.log("Existing score for user:", existingScore);

            if (score > existingScore) {
                await db.removeScore(user_id, song_id);
                await db.submitScore(user_id, song_id, score);
                return res.status(200).json({ message: 'High score updated!' });
            } else {
                return res.status(200).json({ message: 'Score not high enough, will not be updated.' });
            }
        } else {
            await db.submitScore(user_id, song_id, score);
            return res.status(200).json({ message: 'High score added!' });
        }
    } catch (err) {
        console.error('Error handling /submitScore:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});



app.get('/getAndDisplayScores', async (req, res) => {
    const song_id = req.query.song_id; // Get song_id from query parameters
    console.log("song id to search:", song_id)
    if (!song_id) {
        return res.status(400).json({ error: 'song_id query parameter is required' });
    }

    try {
        // Fetch scores from the database
        const results = await db.getSortedScoresWithRank(song_id);
        console.log("Existing scores for the song to display:", results);  // Log the existing scores
        // Respond with JSON data
        res.json(results);
    } catch (err) {
        console.error('Error fetching scores:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
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

app.post('/createAccount', async function (req, res) {

    try {
        var bcrypt = require('bcryptjs');
        var hash = bcrypt.hashSync(req.body.password, 10);

        //console.log("Username : " + req.body.username);
        //console.log("Email : " + req.body.email);
        //console.log("Hashed & salted password : " + hash);

        var username = await usernameAvailable(req.body.username);

        if (username) {
            // Make users account
            var newSessionId = Math.floor(Math.random() * 999999999);
            var sessionID = bcrypt.hashSync(newSessionId.toString(), 5);

            var time = Date.now();
            var userID = await createAccount(req.body.username, req.body.email, hash, time, sessionID);
            if (userID) {
                res.cookie('userID', userID);
                res.cookie('sessionID', sessionID);
            } else {
                // failed for unknown reason
                console.error('Failed to create account.', err);
            }

        } else {
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

app.post('/login', async function (req, res) {
    try {
        var data = await login(req.body.username);
        var bcrypt = require('bcryptjs');
        userID = data[0];
        hash = data[1];

        //console.log(data[0]);
        //console.log(data[1]);

        if (bcrypt.compareSync(req.body.password, hash)) {
            var newSessionId = Math.floor(Math.random() * 999999999);
            var sessionID = bcrypt.hashSync(newSessionId.toString(), 5);
            var time = Date.now();
            createSession(userID, sessionID, time);

            res.cookie('userID', userID);
            res.cookie('sessionID', sessionID);
        } else {
            console.error('Incorrect username or password.', err);
        }

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to log in' });
    }
});

// Clear current login info
app.post('/logout', function (req, res) {
    res.clearCookie('userID');
    res.clearCookie('sessionID');
    res.redirect('/');
});

const { getUserData } = require('./database.js');

const { validSession } = require('./database.js');


// Get user data for statistics
app.post('/verifyuser', async function (req, res) {
    try {
        // check if session is valid, if not then delete user's token and send to login screen.
        if (await validSession(req.cookies.userID, req.cookies.sessionID)) {
            res.json(await getUserData(req.cookies.userID, req.cookies.sessionID));
        } else {
            res.clearCookie('userID');
            res.clearCookie('sessionID');
            console.error('Invalid session.', err);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching user data' });
    }
});

const { setStatistics } = require('./database.js');

// Update user's statistics
app.post('/setuserstatistics', async function (req, res) {
    try {

        // if session is invalid or logged out then instead use -1 for id as a 'guest' statistics so they are included in global
        if (req.cookies.userID !== undefined && req.cookies.sessionID !== undefined) {
            if (await validSession(req.cookies.userID, req.cookies.sessionID)) {
                // 
                setStatistics(req.cookies.userID, parseInt(req.body.score), parseInt(req.body.missedNotes), parseInt(req.body.totalNotes), parseInt(req.body.maxCombo));
            } else {
                // Guest
                setStatistics(-1, parseInt(req.body.score), parseInt(req.body.missedNotes), parseInt(req.body.totalNotes), parseInt(req.body.maxCombo));
            }
        } else {
            // Guest
            setStatistics(-1, parseInt(req.body.score), parseInt(req.body.missedNotes), parseInt(req.body.totalNotes), parseInt(req.body.maxCombo));
        }


    } catch (err) {

    }
});

const { getStatistics } = require('./database.js');
// Update user's statistics
app.post('/getuserstatistics', async function (req, res) {
    try {
        res.json(await getStatistics(req.cookies.userID));
    } catch (err) {

    }
});

// Below will be the code for multiplayer and score system. 

let clients = [];
function NumOfClients() {
    let n = 0;
    for (let i in clients) ++n;
    return n;
}