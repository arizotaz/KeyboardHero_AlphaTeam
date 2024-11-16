const { getScores } = require('../database');
const { getSongScores } = require('../database');
const { sortHighToLow } = require('../database');
const { submitScore } = require('../database');
const mysql = require('mysql2');

// Mock the MySQL pool
jest.mock('mysql2', () => {
  const mockPool = {
    promise: jest.fn().mockReturnThis(),
    query: jest.fn(),
  };
  return {
    createPool: jest.fn(() => mockPool),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getScores', () => {
  it('should return scores from the database', async () => {
    const mockScores = [{ score: 100 }, { score: 200 }];
    mysql.createPool().promise().query.mockResolvedValue([mockScores]);

    const result = await getScores();
    expect(result).toEqual(mockScores);

    
  });

  it('should throw an error when the query fails', async () => {
    // Suppress console.error in the test logs
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const mockError = new Error('Query failed');
    mysql.createPool().promise().query.mockRejectedValue(mockError);

    await expect(getScores()).rejects.toThrow('Query failed');

    // Restore console.error after the test
    mockConsoleError.mockRestore();
  });
});

describe('getSongScores', () => {
  it('should return scores from the database that have a certain song_id', async () => {
    const mockScores = [{ score: 100, song_id: "abc", user_id: "123"}];
    mysql.createPool().promise().query.mockResolvedValue([mockScores]);

    const result = await getSongScores("abc");
    
    expect(mysql.createPool().promise().query).toHaveBeenCalledWith(
      'SELECT * FROM scores WHERE song_id = ?;', 
      ['abc']
    );

    expect(result).toEqual(mockScores);
  });

  it('should throw an error when the query fails', async () => {
    // Suppress console.error in the test logs
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const mockError = new Error('Query failed');
    mysql.createPool().promise().query.mockRejectedValue(mockError);

    await expect(getSongScores('abc')).rejects.toThrow('Query failed');

    // Restore console.error after the test
    mockConsoleError.mockRestore();
  });
});

describe('sortHighToLow', () => {
  
  it('should sort the items in descending order by score', async () => {
    const items = [
      { score: 100, song_id: "A", user_id: "111" },
      { score: 300, song_id: "B", user_id: "222" },
      { score: 200, song_id: "C", user_id: "333" }
    ];

    const sortedItems = await sortHighToLow(items);
    
    // Check if it sorts in descending order
    expect(sortedItems).toEqual([
      { score: 300, song_id: "B", user_id: "222" },
      { score: 200, song_id: "C", user_id: "333" },
      { score: 100, song_id: "A", user_id: "111" }
    ]);
  });

  it('should return an empty array if the input is an empty array', async () => {
    const items = [];

    const sortedItems = await sortHighToLow(items);
    
    // Check if it returns an empty array
    expect(sortedItems).toEqual([]);
  });

  it('should throw an error if input is not an array', async () => {
    // Optionally, you could test invalid input handling
    const invalidInput = null;

    // Check if the function throws an error
    await expect(sortHighToLow(invalidInput)).rejects.toThrow();
  });
});

describe('submitScore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should submit the score successfully', async () => {
      // Mock successful response
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ message: 'Score recorded successfully!' }),
      });

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await submitScore(1, 'song123', 95);

      expect(fetch).toHaveBeenCalledWith(
          'http://localhost:32787/submitScore',
          expect.objectContaining({
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: 1, song_id: 'song123', score: 95 }),
          })
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('Score submitted successfully:', 'Score recorded successfully!');

      consoleLogSpy.mockRestore();
  });

  it('should throw an error for missing input', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await submitScore(null, 'song123', 95);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error during score submission:', 'Invalid inpust: All fields are required.');

      consoleErrorSpy.mockRestore();
  });

  it('should handle server error responses', async () => {
      // Mock server error response
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false, // Simulates the `ok` property for non-200 responses
        status: 500, // Server error status
        json: jest.fn().mockResolvedValue({ error: 'Something went wrong on the server.' }), // Error message in the response body
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await submitScore(1, 'song123', 95);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to submit score:', 'Something went wrong on the server.');

      consoleErrorSpy.mockRestore();
  });

  it('should handle network errors', async () => {
      // Mock network error
      global.fetch = jest.fn(() => Promise.reject(new Error('Network Error')));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await submitScore(1, 'song123', 95);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error during score submission:', 'Network Error');

      consoleErrorSpy.mockRestore();
  });
});