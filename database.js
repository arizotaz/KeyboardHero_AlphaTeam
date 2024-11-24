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

// login stuff
async function createAccount(username, email, password, time, sessionID) {
    try {   
        // check if username is in use, if so then return false
        //const checkAvailability = "select * from users where user_name = \"" + username + "\";";
        //var availableJSON = await promisePool.query(checkAvailability);
        //var userid;

        // only make account if username is available 
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
