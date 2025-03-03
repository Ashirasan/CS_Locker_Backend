const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

 const verify = (req, res ,next) => {
    const header_token = req.header('auth-token').replace('Bearer ', '');
    
    if (!header_token) return res.status(401).send('Access Denied');
    try {
        const verify = jwt.verify(header_token, process.env.TOKEN_SECRET,(err, user) => {
            if (err) {
                return res.status(403).send('Invalid Token');
            } 
            req.user = user;
            next();
        });
        
        
    } catch (error) {
        res.status(400).send('Invalid Token   ' + header_token);
    }
}

module.exports = verify;



// ตัวอย่าง
// const verifyToken = (req, res, next) => {
//     const accessTokenHeader = req.headers["x-access-token"];
  
  
//     if (!accessTokenHeader) {
//       return res.status(403).send({
//         message: "No Token provided or invalid format!",
//       });
//     }
  
//     const accessToken = accessTokenHeader.split(" ")[1];
//     if (!accessToken) {
//       return res.status(403).send({
//         message: "No Token provided!",
//       });
//     }
  
//     jwt.verify(accessToken, config.secret, (err, decoded) => {
//       if (err) {
//         return res.status(401).send({
//           message: "Unauthorized!",
//         });
//       }
  
//       req.id = decoded.id;
//       next();
//     });
//   };