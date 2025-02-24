import axios from 'axios';
import mysql from '../../connect.js'
import bcrypt from 'bcrypt';
import   crypto from 'crypto';


const key = "6380e4be33ebdbc4fcb5c4cf85995daf36babab2a77c5d6abeef0ba05edae1da";    //32 bytes key   
const iv =  "91e721877f1ef7ef21633d952aaa55e4";  //16 bytes iv

export const getAllLockers = async (req, res) => {
    try {
        const query = `SELECT * FROM lockers`;
        await mysql.query(query, (err, result) => {
            if (err) {
                res.status(400).json({ message: err.message });
            }
            res.status(200).json(result);
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getLockerById = async (req, res) => {
    try {
        req.params.id;
        const query = `SELECT * FROM lockers WHERE locker_id = ${req.params.id}`;
        await mysql.query(query, (err, result) => {
            if (err) {
                res.status(400).json({ message: err.message });
            }
            res.status(200).json(result);
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

// get locker reservation all
export const getRsvAll = async (req,res) =>{
    try{
        const query = `SELECT * FROM reservations`;
        await mysql.query(query,(err,result) =>{
            if(err){
                res.status(400).json({ message: err.message });
            }
            res.status(200).json(result);
        })
    }catch(error){
        res.status(404).json({message: error.message})
    }
}

// get locker reservation by user
export const getRsvByUserId = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const query = `SELECT * FROM reservations JOIN lockers ON reservations.locker_id = lockers.locker_id WHERE reservations.user_id = ?`;
        await mysql.query(query, [user_id], (err, result) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            res.status(200).json(result);
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const createLocker = async (req, res) => {
    try {
        const locker_num = req.body.locker_num;
        const locker_status = 1; // online

        const check = `SELECT * FROM lockers WHERE locker_num = '${locker_num}'`;
        await mysql.query(check, async (err, result) => {
            if (err) {
                res.status(400).json({ message: err.message });
            }
            if (result.length > 0) {
                res.status(400).json({ message: "Locker already exist" });
            } else {
                const insert = `INSERT INTO lockers (locker_num, locker_status) values ('${locker_num}', '${locker_status}')`;
                await mysql.query(insert, (err, result) => {
                    if (err) {
                        res.status(400).json({ message: err.message });
                    }
                    res.status(200).json({ message: "Create locker complete" });
                })
            }
        })

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const updateStatusLocker = async (req, res) => {
    try {
        const locker_id = req.body.id;
        const locker_status = req.body.locker_status;

        const update = `UPDATE lockers SET locker_status = '${locker_status}' WHERE locker_id = ${locker_id}`;
        await mysql.query(update, (err, result) => {
            if (err) {
                res.status(400).json({ message: err.message });
            }
            res.status(200).json({ message: "Update locker status complete" });
        })
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const reservationLocker = async (req, res) => {
    try {
        const locker_id = req.body.locker_id;
        const locker_num = req.body.locker_num;
        const user_id = req.body.user_id;
        const date = new Date();
        
        
        const password = (Math.floor(100000 + Math.random() * 900000)).toString();

        console.log("Original Password:", password);
        
        function encrypt(text, key, iv) {
            const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return {
                iv: iv.toString('hex'),
                encryptedData: encrypted,
                key: key.toString('hex') 
            };
        }
        
        // Decrypt function
        // function decrypt(encryptedData, key, iv) {
        //     const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
        //     let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        //     decrypted += decipher.final('utf8');
        //     return decrypted;
        // }
        
        // Encrypt the password
        const encrypted = encrypt(password, key, iv);
        console.log("Encrypted Password:", encrypted.encryptedData);
        console.log("IV:", encrypted.iv);
        console.log("Key:", encrypted.key);
        
        
        const check = `SELECT * FROM reservations WHERE locker_id = '${locker_id}'`;
        await mysql.query(check, async (err, result) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            if (result.length > 0) {
                return res.status(400).json({ message: "Locker already reserved" });
            }
            else {  // not found locker reservation
                
                // const bcryptPassword = await bcrypt.hash(password.toString(), parseInt(process.env.BYCRYPT_LOCKER_SECRET));
                // console.log(bcryptPassword);
                const insert = `INSERT INTO reservations (user_id, locker_id, password,date) VALUES (?, ?, ?, ?)`;
                await mysql.query(insert, [user_id, locker_id, encrypted.encryptedData, date], async (err, result) => {
                    if (err) {
                        return res.status(400).json({ message: err.message });
                    }
                    else {
                        //mqtt
                        const message_toboard = {
                            "index": locker_num,
                            "status": 1
                        }
                        const response = await axios.put('https://api.netpie.io/v2/device/message?topic=locker%2Frsv', message_toboard, {
                            headers: {
                                'Authorization': 'Device ' + process.env.mqtt_client_id + ":" + process.env.mqtt_token,
                            },
                        })
                        // res
                        res.status(200).json({ message: "Reservation locker complete" });
                    }
                })
            }
        })


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const cancelreservationLocker = async (req, res) => {
    try {
        const rsv_id = req.body.rsv_id;
        const locker_num = req.body.locker_num

        const check = `SELECT * FROM reservations WHERE rsv_id = ${rsv_id}`;
        await mysql.query(check, async (err, result) => {
            if (err) {
                res.status(400).json({ message: err.message });
            }
            if (result.length === 0) {
                res.status(404).json({ message: "Reservation not found" });
            } else {
                const deleteQuery = `DELETE FROM reservations WHERE rsv_id = ${rsv_id}`;
                await mysql.query(deleteQuery, async (err, result) => {
                    if (err) {
                        res.status(400).json({ message: err.message });
                    }
                    //mqtt
                    const message_toboard = {
                        "index": locker_num,
                        "status": 0
                    }
                    const response = await axios.put('https://api.netpie.io/v2/device/message?topic=locker%2Fcancelrsv', message_toboard, {
                        headers: {
                            "Authorization": "Device " + process.env.mqtt_client_id + ":" + process.env.mqtt_token,
                        },
                    })
                    //res
                    res.status(200).json({ message: "Cancel reservation locker complete" });
                });
            }
        })
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

// export const comparePassword = async (req, res) => {
//     try {
//         const input_password = req.body.input_password
//         var count_star = 0,locker_num = "", password = "";
//         console.log(input_password);
        
//         for (let i = 0; i < input_password.length; i++) {
//             if (input_password[i] === "*") count_star++;
//             else if (count_star === 1) locker_num += input_password[i];
//             else if (count_star === 2) password += input_password[i];
//         }

//         console.log(locker_num);
//         console.log(password);
//         const query = `SELECT * FROM reservations JOIN lockers ON reservations.locker_id = lockers.locker_id WHERE locker_num = ${locker_num}`;
//         await mysql.query(query, async (err, result) => {
//             if(err){
//                 res.status(400).json({ message: err.message });
//             }
//             if(result.length === 0){
//                 res.status(404).json({ message: "Reservation on locker number " + locker_num + " not found not found" });
//             }else{
               
//                 const passwordE = result[0]?.password?.toString('hex');
//                 console.log(passwordE);
                

                

               

//                 const decrypted = decrypt(passwordE, key, iv);
//                 console.log("Decrypted Password:", decrypted);

//                 if(password === result[0].password){
//                     res.status(200).json({ "index": locker_num, "unlock": 1 });
//                 }else{
//                     res.status(200).json({ "index": locker_num, "unlock": 0 });
//                 }
//             }
//         })
//     } catch (error) {
//         res.status(404).json({ message: error.message });
//     }
// }



export const comparePassword = async (req, res) => {
    try {
        const input_password = req.body.input_password;
        let count_star = 0, locker_num = "", password = "";

        console.log("Received input:", input_password);

        for (let i = 0; i < input_password.length; i++) {
            if (input_password[i] === "*") count_star++;
            else if (count_star === 1) locker_num += input_password[i];
            else if (count_star === 2) password += input_password[i];
        }

        console.log("Locker Number:", locker_num);
        console.log("Input Password:", password);

        const query = `SELECT * FROM reservations JOIN lockers ON reservations.locker_id = lockers.locker_id WHERE locker_num = ?`;
        
        // Use Promises with MySQL
        mysql.query(query, [locker_num], async (err, result) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            if (result.length === 0) {
                return res.status(404).json({ message: `Reservation on locker number ${locker_num} not found.` });
            }

            const passwordE = result[0]?.password; // Get encrypted password from DB

            console.log("Encrypted Password from DB:", passwordE);

            if (!passwordE) {
                return res.status(400).json({ message: "Stored password is missing." });
            }

            // Retrieve Key & IV from the database (adjust if stored elsewhere)
            // const key = result[0]?.encryption_key; // Must be 32 bytes (hex)
            // const iv = result[0]?.encryption_iv;   // Must be 16 bytes (hex)

            if (!key || !iv) {
                return res.status(400).json({ message: "Encryption key or IV missing." });
            }

            console.log("Key (hex):", key);
            console.log("IV (hex):", iv);

            function decrypt(encryptedData, key, iv) {
                try {
                    const keyBuffer = Buffer.from(key, 'hex');
                    const ivBuffer = Buffer.from(iv, 'hex');
            
                    if (keyBuffer.length !== 32 || ivBuffer.length !== 16) {
                        throw new Error("Invalid key or IV length");
                    }
            
                    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer);
                    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
                    decrypted += decipher.final('utf8');
                    return decrypted;
                } catch (error) {
                    throw new Error("Decryption failed. Invalid data or key/IV mismatch.");
                }
            }
            
            

            try {
                const decryptedPassword = decrypt(passwordE, key, iv);
                console.log("Decrypted Password:", decryptedPassword);

                if (password === decryptedPassword) {
                    return res.status(200).json({ "index": locker_num, "unlock": 1 });
                } else {
                    return res.status(200).json({ "index": locker_num, "unlock": 0 });
                }
            } catch (decryptionError) {
                return res.status(500).json({ message: "Decryption failed. Invalid data or key/IV mismatch." });
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
