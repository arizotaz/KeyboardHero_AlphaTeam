require("dotenv").config();

const mysql = require('mysql2');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'alphateam',
    database: 'keyboard_hero',
    password: 'AlphaTeam',
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
        console.log(Object.keys(availableJSON[0]).length === 0);
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
        const query = "select user_name,session_id from users where user_id = \"" + userID + "\";";
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

module.exports = {
    getScores, getSongScores, sortHighToLow, createAccount, login, createSession, usernameAvailable, getUserData
};
