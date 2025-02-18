const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

 const verify = (req, res) => {
    const header_token = req.header('auth-token');
    if (!header_token) return res.status(401).send('Access Denied');
    try {
        const token = header_token.split(' ')[1];
        const verify = jwt.verify(token, process.env.TOKEN_SECRET,(err, user) => {
            if (err) {
                return res.status(403).send('Invalid Token');
            }
            return user;
        });
        req.user = verify;
        next();
    } catch (error) {
        res.status(400).send('Invalid Token   ' + header_token);
    }
}

module.exports = verify;