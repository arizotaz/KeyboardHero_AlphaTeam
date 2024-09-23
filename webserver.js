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

// Web Server Port
var port = 32787;
if (fs.existsSync(__dirname + "/port.txt")) port = parseInt(fs.readFileSync(__dirname + "/port.txt"));


// Sets the Cors access policy
app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
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


// Below will be the code for multiplayer and score system. 