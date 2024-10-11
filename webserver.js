/*   Require Packages from Node JS   */
// Web Server Wrapper
var express = require('express');
// Web Server Wrapper Object
var app = express();
// HTTP Server
var serv = require('http').Server(app);
// Cors access policy
var cors = require('cors');
// Allow execution of binaries on the server
const { exec } = require("child_process");
// File System Library
const fs = require('fs');
// database functions
const { getScores } = require('./client/database.js');

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

// Web Server Port
var port = 32787;
if (fs.existsSync(__dirname + "/port.txt")) port = parseInt(fs.readFileSync(__dirname + "/port.txt"));

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

// 404 Status page
app.get('*', function (req, res) {
    res.status(404).sendFile(__dirname + '/404.html');
});

// start the server
serv.listen(port);
console.log(`Server started on: http://localhost:${port}`);


// FILE UPLOADS ---------------------------------

// multer for file uploads
const multer = require('multer');
// require for running python processing script
const { spawn } = require("child_process");

//storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/client/assets/game/keyboardhero/levels'); // folder to hold mp3s
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // ensures use of original file name
    }
});

// create multer object
const upload = multer({ storage: storage });

// upload and process files
app.post('/newSongUpload', upload.single('newSong'), (req, res) => {

    // location of where levels are stored
    const levelLocation = __dirname + "/client/assets/game/keyboardhero/levels/";

    const songFilePath = levelLocation + req.file.originalname; // final mp3 file path
    const songName = req.file.originalname; // original mp3 name

    // launch python process with song file path and original mp3 name
    const pythonProcess = spawn("python", [__dirname + "/beatmapGenerator.py", songFilePath, songName]);

    // delete original mp3 when python process closes
    pythonProcess.on('close', (code) => {
        fs.unlink(songFilePath, (err) => {
            if (err) {
                console.error('ORIGINAL MP3 DELETION ERROR:', err);
            } else {
                console.log('MP3 DELETED SUCCESSFULLY.');
            }
        });
    })

    // send info back to webpage
    res.json({ 
        message: 'File uploaded successfully!',
        filename: req.file.originalname 
    });
});

// FILE UPLOADS END -----------------------------


// Below will be the code for multiplayer and score system. 