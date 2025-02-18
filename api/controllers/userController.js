import mysql from '../../connect.js';

export const getAllUsers = async (req, res) => {
  try {
    const query = 'SELECT * FROM users';
    mysql.query(query, (err, result) => {
      if (err) {
        res.status(400).json({ message: err.message });
      }
      res.status(200).json(result);
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}
