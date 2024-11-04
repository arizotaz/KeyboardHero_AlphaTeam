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
const { getScores } = require('./database.js');

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


// upload and process files
app.post('/newSongUpload', upload.single('file'), (req, res) => {

    // location of where levels are stored
    const levelLocation = tempFileUploads;

    const songFilePath = levelLocation + req.file.originalname; // final mp3 file path
    const songName = req.file.originalname.replaceAll(".mp3", ""); // original mp3 name

    const JSONFilePath = levelLocation + songName + ".json";

    // launch python process with song file path and original mp3 name
    const pythonProcess = spawn(pythonBinary, [__dirname + "/beatmapGenerator.py", songFilePath, songName]);

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
app.post('/createAccount', function(req, res){

    var bcrypt = require('bcryptjs');
    console.log("Username : " + req.body.username);
    console.log("Email : " + req.body.email);
    var hash = bcrypt.hashSync(req.body.password, 10);
    console.log("Hashed & salted password : " + hash);
   
    // Create Cookies with the username and email, will make a session once I learn how to do so
    res.cookie('username', req.body.username);
    res.cookie('email', req.body.email);
    res.redirect('/');
});

// Clear current login info
app.post('/logout', function(req, res){
res.clearCookie('username');
res.clearCookie('email');
res.redirect('/');
});



// Below will be the code for multiplayer and score system. 