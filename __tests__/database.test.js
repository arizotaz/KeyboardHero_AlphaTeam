const { getScores } = require('../database');
const { getSongScores } = require('../database');
const { sortHighToLow } = require('../database');
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
    const mockScores = [{ score: 100, song_id: "abc", user_id: "adv"}];
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
      { score: 100, song_id: "A", user_id: "AAA" },
      { score: 300, song_id: "B", user_id: "BBB" },
      { score: 200, song_id: "C", user_id: "CCC" }
    ];

    const sortedItems = await sortHighToLow(items);
    
    // Check if it sorts in descending order
    expect(sortedItems).toEqual([
      { score: 300, song_id: "B", user_id: "BBB" },
      { score: 200, song_id: "C", user_id: "CCC" },
      { score: 100, song_id: "A", user_id: "AAA" }
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