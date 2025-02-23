import axios from 'axios';
import mysql from '../../connect.js'
import bcrypt from 'bcrypt';
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

export const createLocker = async (req, res) => {
    try {
        const locker_status = 1; // online

        const insert = `INSERT INTO lockers (locker_status) VALUES ('${locker_status}')`;
        await mysql.query(insert, (err, result) => {
            if (err) {
                res.status(400).json({ message: err.message });
            }
            res.status(200).json({ message: "Create locker complete" });
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
        const user_id = req.body.user_id;
        const password = Math.random().toString(10).slice(-6);
        console.log(password);

        
        const check = `SELECT * FROM reservations WHERE locker_id = '${locker_id}'`;
        await mysql.query(check, async (err, result) => {
            if (err) {
                res.status(400).json({ message: err.message });
            }
            if (result.length > 0) {
                res.status(400).json({ message: "Locker already reserved" });
            }
        })

        const bcryptPassword = await bcrypt.hash(password.toString(), parseInt(process.env.BYCRYPT_LOCKER_SECRET));
        console.log(bcryptPassword);
        
        const insert = `INSERT INTO reservations (user_id, locker_id, password) values ('${user_id}', '${locker_id}', '${bcryptPassword}')`;
        await mysql.query(insert, (err, result) => {
            if (err) {
                res.status(400).json({ message: err.message });
            }else{
                // mqtt


                // res
                res.status(200).json({ message: "Reservation locker complete" });
            }
            
        })


    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}


export const comparePassword = async (req, res) => {
    try {
        const locker_num = req.body.locker_num;
        const input_password = req.body.input_password;

        const query = `SELECT * FROM reservations JOIN lockers ON reservations.locker_id = lockers.locker_id WHERE lockers.locker_num = '${locker_num}'`;
        
        var query_password = '';
        await mysql.query(query, async (err, result) => {
            if (err) {
                res.status(400).json({ message: err.message });
            }
            if (result.length === 0) {
                res.status(400).json({ message: "Locker not found" });
            }
            query_password = result[0].password;
            const checkPassword = await bcrypt.compare(input_password, query_password,);
            console.log(checkPassword);
            
            if (!checkPassword) {
                res.status(400).json({ message: "Password not match" });
            }else{
                res.status(200).json({ message: "Password match" });
            }

        });
        // const response = await axios.get('https://api.netpie.io/v2/device/shadow/data', {
        //     headers: {
        //         'Authorization': 'Device ' + process.env.mqtt_client_id + ":" + process.env.mqtt_token,
        //     },
        //     body: {
        //         "data": {
        //             "index": locker_num,
        //             "unlock": true
        //         }

        //     }
        // })
        // res.status(200).json({ message: "Password match" });

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}


export const lockerDecryptPassword = async (req, res) => {
    try {
        const locker_num = req.params.locker_num;
        const query = `SELECT * FROM reservations JOIN lockers ON reservations.locker_id = lockers.locker_id WHERE lockers.locker_num = '${locker_num}'`;
        await mysql.query(query, async (err, result) => {
            if (err) {
                res.status(400).json({ message: err.message });
            }
            if (result.length === 0) {
                res.status(400).json({ message: "Locker not found" });
            }
            
            res.status(200).json({ password: result[0].password });
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}