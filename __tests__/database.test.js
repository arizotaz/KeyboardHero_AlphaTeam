const { getScores } = require('../client/database');
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
