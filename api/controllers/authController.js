// const jwt = require('jsonwebtoken');
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        // const user = await User.findOne({ email }); // Find user by email
        // not yet


        const userId = 20 // fixed value
        //token
        // console.log(process.env.TOKEN_SECERT);
        const token = jwt.sign({id: userId},process.env.TOKEN_SECRET);
        
        
        res.header('auth-token', token).send(token);
    } catch (error) {    
        res.status(500).json({ message: error.message });
    }
};