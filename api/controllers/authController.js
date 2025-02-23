// const jwt = require('jsonwebtoken');
import jwt from 'jsonwebtoken';
import mysql from '../../connect.js';
import bcrypt from 'bcrypt';
import { parse } from 'dotenv';



export const register = async (req, res) => {
    try{
        const username = req.body.username;
        const password = req.body.password;
        const name = req.body.name;
        const email = req.body.email;
        const bcryptPassword = await bcrypt.hash(password, parseInt(process.env.BYCRYPT_SECRET));
        const insert = `INSERT INTO users (username, password, name, email) VALUES ('${username}', '${bcryptPassword}', '${name}', '${email}')`;
        const check = `SELECT * FROM users WHERE username = '${username}'`;
        await mysql.query(check, async (err, result) => {
            if (result.length > 0) {
                res.status(400).json({ message: "User already exists" });
            }
        })
        await mysql.query(insert, (err, result) => {
            if (err) {
                res.status(400).json({ message: err.message });
            }
            res.status(200).json({ message: "Register complete" });
        });
    }catch(error){
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const query = `SELECT * FROM users WHERE username = '${username}'`;
        
        await mysql.query(query, async (err, result) => {
            // console.log(result[0].password);
            // if (err) {
            //     res.status(400).json({ message: err.message });
            // }
            if (result.length === 0) {
                res.status(400).json({ message: "User not found" });
            }
            const passwordMatch = await bcrypt.compare(password, result[0].password);
            if (!passwordMatch) {
                res.status(400).json({ message: "Password not match" });
            }else{
                const token = jwt.sign({id: result[0].user_id},process.env.TOKEN_SECRET);
                res.header('auth-token', token).send(token); // fixed send token
            }
        }); 

        
    } catch (error) {    
        res.status(500).json({ message: error.message });
    }
};

export const logout = async (req, res) => {

    try{
        res.header('auth-token', '');
        res.status(200).json({ message: "Logged out" });
    }catch(error){
        res.status(500).json({ message: error.message });
    }
    
};

