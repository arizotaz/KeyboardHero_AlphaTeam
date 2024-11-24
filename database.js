require("dotenv").config();

const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
});

// Use the `promise()` function of the pool for promise-based queries
const promisePool = pool.promise();

// Async function to get scores
async function getScores() {
    try {
        const [rows] = await promisePool.query("SELECT * FROM scores;");
        return rows;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function getSongScores(song_id) {
    try {
        const [rows] = await promisePool.query("SELECT * FROM scores WHERE song_id = ?;", [song_id]);
        return rows;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function sortHighToLow(items){
    try {
        
        return items.sort((a, b) => b.score - a.score);
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function submitScore(user_id, song_id, score) {
    try {
        if (!user_id || !song_id ||typeof score !== 'number') {
            throw new Error('Invalid inpust: All fields are required.');
        }

        //send POST request to the server
        const response = await fetch('http://localhost:32787/submitScore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({user_id, song_id, score}),
        });

        //parse the JSON response
        const result = await response.json();

        if(response.ok){
            console.log('Score submitted successfully:', result.message);
        } else {
            console.error('Failed to submit score:', result.error);
        }
    } catch(error){
        console.error('Error during score submission:', error.message);
    }
};

async function fetchAndDisplayScores(song_id) {
    try {
        const response = await fetch(`/api/scores/${song_id}`);
        if (!response.ok) throw new Error("Failed to fetch scores");

        let scores = await response.json();
        scores = scores.sort((a, b) => b.score - a.score);

        const tableBody = document.querySelector("#scoreboard tbody");
        tableBody.innerHTML = "";

        scores.forEach((score) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${score.player_name || "Anonymous"}</td>
                <td>${score.score}</td>
                <td>${new Date(score.date).toLocaleString()}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error displaying scores:", error);
    }
}

// login stuff
async function createAccount(username, email, password, time, sessionID) {
    try {   
        // check if username is in use, if so then return false
        //const checkAvailability = "select * from users where user_name = \"" + username + "\";";
        //var availableJSON = await promisePool.query(checkAvailability);
        //var userid;
        //const checkAvailability = "select * from users where user_name = \"" + username + "\";";
        //var availableJSON = await promisePool.query(checkAvailability);
        //var userid;

        // only make account if username is available 
        //if (Object.keys(availableJSON[0]).length === 0){
        //if (Object.keys(availableJSON[0]).length === 0){

            var IDused = true;
            while (IDused){
                userid = Math.floor(Math.random() * 999999999);
                const checkIDAvailability = "select * from users where user_id = \"" + userid + "\";";
                var availableIDJSON = await promisePool.query(checkIDAvailability);

                if (Object.keys(availableIDJSON[0]).length === 0){
                    IDused = false;
                }
            }
            const query = "insert into users (user_id, user_name, user_password, user_email, last_login, session_id) values (" + userid + ",\"" + username + "\",\"" + password + "\",\"" + email + "\",\"" + time + "\",\"" + sessionID +"\");";
            await promisePool.execute(query);

            // give webserver the go ahead to make a cookie for user
            return userid;
        //}else{
        ///    return 0;
        //}
    } catch (err) {
        console.error(err);
        throw err;
        
    }
}

async function usernameAvailable(username) {
    try {   
        // check if username is in use, if so then return false
        const checkAvailability = "select * from users where user_name = \"" + username + "\";";
        var availableJSON = await promisePool.query(checkAvailability);
        var userid;
        if (Object.keys(availableJSON[0]).length === 0){
            return true;
        }else{
            return false;
            return false;
        }
    } catch (err) {
        console.error(err);
        throw err;
        
    }
}

async function login(username) {
    try {
        const getHash = "select * from users where user_name = \"" + username + "\";";
        var userdataJSON = await promisePool.query(getHash);

        if (Object.keys(userdataJSON[0]).length !== 0){
            var convert = JSON.stringify(userdataJSON[0]);
            var converted = JSON.parse(convert);  

            return [converted[0].user_id, converted[0].user_password];
        }else{
            return "account not found";
        }
    } catch (err) {
        console.error(err);
        throw err;  
    }
}

async function createSession(userID, sessionID, time) {
    try {
        const query = "update users set session_id = \"" + sessionID + "\", last_login = \"" + time + "\" where user_id = \"" + userID + "\";";
        await promisePool.execute(query);
    } catch (err) {
        console.error(err);
        throw err;  
    }
}

async function getUserData(userID, userToken) {
    try {
        const query = "select user_name,last_login,session_id from users where user_id = \"" + userID + "\";";
        var userdataJSON = await promisePool.execute(query);

        var convert = JSON.stringify(userdataJSON[0]);
        var converted = JSON.parse(convert); 

        //console.log(converted[0].user_name);
        return converted[0];
        
    } catch (err) {
        console.error(err);
        throw err;  
    }
}

//check if session is valid
async function validSession(userID, userToken) {
    try {
        var data = await getUserData(userID, userToken);

        // session is valid if token matches id and is not over a week old
        if (((Date.now() - data.last_login) <= 604800000) && (data.session_id == userToken)){
            return true;
        }else{
            return false;
        }
       // console.log(data.session_id);
       // console.log(data.last_login);
       // console.log(data.user_name);

    } catch (err) {
        console.error(err);
        throw err; 
    }
}

//set user statistics
async function setStatistics(userID, score, missedNotes, totalNotes, maxCombo) {
    try {
        // check if the user already has an entry, if not then create one
        const query = "select * from statistics where user_id = \"" + userID + "\";";
        var userStatisticsJSON = await promisePool.execute(query);


        if (Object.keys(userStatisticsJSON[0]).length !== 0){
            var convert = JSON.stringify(userStatisticsJSON[0]);
            var converted = JSON.parse(convert); 

            var newScore = score + converted[0].points;
            var newMissedNotes = missedNotes + converted[0].misses;
            var newTotalNotes = converted[0].hits + (totalNotes - missedNotes); 
            if (maxCombo <= converted[0].highest_combo){
                const setData = "update statistics set points = \"" + newScore + "\", misses = \"" + newMissedNotes + "\", hits = \"" + newTotalNotes + "\" where user_id = \"" + userID + "\";";
                await promisePool.execute(setData);
            }else{
                const setData = "update statistics set points = \"" + newScore + "\", highest_combo = \"" + maxCombo + "\", misses = \"" + newMissedNotes + "\", hits = \"" + newTotalNotes + "\" where user_id = \"" + userID + "\";";
                await promisePool.execute(setData);
            }
        }else{
            var newTotalNotes = (totalNotes - missedNotes); 

            const setData = "insert into statistics (user_id, points, highest_combo, misses, hits) values (\"" + userID + "\", \"" + score + "\", \"" + maxCombo + "\", \"" + missedNotes + "\", \"" + newTotalNotes + "\");";
            await promisePool.execute(setData);
        }
    } catch (err) {
        console.error(err);
        throw err; 
    }
}

//pull statistics
async function getStatistics(userID) {
    try {
        const query = "select * from statistics where user_id = \"" + userID + "\";";
        var userStatisticsJSON = await promisePool.execute(query);

        var convert = JSON.stringify(userStatisticsJSON[0]);
        var converted = JSON.parse(convert); 


        // SUM/MAX functions return these as sum(points) which is seen as a function in js. Needs some processing first to properly access.

        // Get total points
        const queryPoints       = "select sum(points) from statistics;";
        var globalPointsJSON    = await promisePool.execute(queryPoints);
        var convertPoints       = JSON.stringify(globalPointsJSON[0]);
        convertPoints           = convertPoints.replace('(','');
        convertPoints           = convertPoints.replace(')','');
        var convertedPoints     = JSON.parse(convertPoints); 


        // Get highest combo
        const queryCombo        = "select max(highest_combo) from statistics;";
        var globalComboJSON     = await promisePool.execute(queryCombo);
        var convertCombo        = JSON.stringify(globalComboJSON[0]);
        convertCombo            = convertCombo.replace('(','');
        convertCombo            = convertCombo.replace(')','');
        var convertedCombo      = JSON.parse(convertCombo);


        // Get total misses
        const queryMisses       = "select sum(misses) from statistics;";
        var globalMissesJSON    = await promisePool.execute(queryMisses);
        var convertMisses       = JSON.stringify(globalMissesJSON[0]);
        convertMisses           = convertMisses.replace('(','');
        convertMisses           = convertMisses.replace(')','');
        var convertedMisses     = JSON.parse(convertMisses);
        
        // Get total hits
        const queryHits         = "select sum(hits) from statistics;";
        var globalHitsJSON      = await promisePool.execute(queryHits);
        var convertHits         = JSON.stringify(globalHitsJSON[0]);
        convertHits             = convertHits.replace('(','');
        convertHits             = convertHits.replace(')','');
        var convertedHits       = JSON.parse(convertHits);

        // Bundle all the data into a JSON to pass back to client
        var statistics = new Object();
        statistics.userPoints = converted[0].points;
        statistics.userCombo = converted[0].highest_combo;
        statistics.userMisses = converted[0].misses;
        statistics.userHits = converted[0].hits;

        statistics.globalPoints = convertedPoints[0].sumpoints;
        statistics.globalCombo = convertedCombo[0].maxhighest_combo;
        statistics.globalMisses = convertedMisses[0].summisses;
        statistics.globalHits = convertedHits[0].sumhits;


        return statistics;

    } catch (err) {
        console.error(err);
        throw err; 
    }
}

module.exports = {
    getScores, getSongScores, sortHighToLow, createAccount, login, createSession, usernameAvailable, getUserData, validSession, setStatistics, getStatistics
};
