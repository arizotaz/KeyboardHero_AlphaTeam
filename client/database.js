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

// Call the `getScores` function and handle the promise correctly
getScores().then(bestscores => {
    console.log(bestscores);
}).catch(err => {
    console.error("Error fetching scores:", err);
});

module.exports = {
    getScores,
};