async function submitScore(user_id, song_id, score) {
    try {
        if (!user_id || !song_id || typeof score !== 'number') {
            throw new Error('Invalid input: All fields are required.');
        }

        // Send POST request to submit the score
        const response = await fetch('http://localhost:32787/submitScore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id, song_id, score }),
        });

        // Parse the response
        const result = await response.json();
        if (response.ok) {
            console.log('Score submitted successfully:', result.message);
            // After submitting, fetch and display the updated scores
            displayScores(song_id);
        } else {
            console.error('Failed to submit score:', result.error);
        }
    } catch (error) {
        console.error('Error during score submission:', error.message);
    }
}

// Fetch and display scores
async function displayScores(song_id) {
    try {
        const response = await fetch(`http://localhost:32787/api/scores/${song_id}`);
        const scores = await response.json();
        const sortedScores = await sortHighToLow(scores);  // Sort from high to low

        // Display scores in the UI (replace this with actual DOM manipulation code)
        const scoreboardElement = document.getElementById("scoreboard");
        scoreboardElement.innerHTML = ''; // Clear previous scores
        sortedScores.forEach((score, index) => {
            const scoreElement = document.createElement("div");
            scoreElement.innerHTML = `Rank: ${index + 1} - User ID: ${score.user_id} - Score: ${score.score}`;
            scoreboardElement.appendChild(scoreElement);
        });
    } catch (err) {
        console.error('Error fetching scores:', err);
    }
}