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
        // console.log(user_id);
        // console.log(locker_id);
        const password = Math.random().toString(10).slice(-6);
        console.log(password);
        const check = `SELECT * FROM reservations WHERE locker_id = '${locker_id}'`;
        await mysql.query(check, async (err, result) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            if (result.length > 0) {
                return res.status(400).json({ message: "Locker already reserved" });
            }
            else {  // not found locker reservation
                const bcryptPassword = password; // plain text password
                // const bcryptPassword = await bcrypt.hash(password.toString(), parseInt(process.env.BYCRYPT_LOCKER_SECRET));
                // console.log(bcryptPassword);
                const insert = `INSERT INTO reservations (users_id, locker_id, password) VALUES (?, ?, ?)`;
                await mysql.query(insert, [user_id, locker_id, bcryptPassword], async (err, result) => {
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

export const comparePassword = async (req, res) => {
    try {
        const input_password = req.body.input_password
        var count_star = 0,locker_num = "", password = "";
        console.log(input_password);
        
        for (let i = 0; i < input_password.length; i++) {
            if (input_password[i] === "*") count_star++;
            else if (count_star === 1) locker_num += input_password[i];
            else if (count_star === 2) password += input_password[i];
        }

        console.log(locker_num);
        console.log(password);
        const query = `SELECT * FROM reservations JOIN lockers ON reservations.locker_id = lockers.locker_id WHERE locker_num = ${locker_num}`;
        await mysql.query(query, async (err, result) => {
            if(err){
                res.status(400).json({ message: err.message });
            }
            if(result.length === 0){
                res.status(404).json({ message: "Reservation on locker number " + locker_num + " not found not found" });
            }else{
                if(password === result[0].password){
                    res.status(200).json({ "index": locker_num, "unlock": 1 });
                }else{
                    res.status(200).json({ "index": locker_num, "unlock": 0 });
                }
            }
        })
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

