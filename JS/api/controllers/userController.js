import mysql from '../../connect.js';
// const mysql = require('../../connect.js');


export const getUserAll = async (req, res) => {
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

export const getUserById = async (req,res) => {
  try{
    const user_id  = req.param.user_id
    const query = `SELECT * FROM users WHERE user_id ='${user_id}'`;
    mysql.query(query,(err,result)=>{
      if(err){
        res.status(400).json({ message: err.message });
      }
      if(result.lenght === 0){
        res.status(404).json({message:"user not found"})
      }else{
        res.status(200).json(result)
      }
    })
  }catch(error){
    res.status(400).json({message: error.message})
  }
}


