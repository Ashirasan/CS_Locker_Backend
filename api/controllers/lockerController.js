import mysql from '../../connect.js'
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
        await mysql.query(query, (err,result) => {
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
        await mysql.query(insert, (err, result)=>{
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
    try{
        const locker_id = req.body.locker_id;
        const user_id = req.body.user_id;
        const password = Math.random().toString(10).slice(-6);
        console.log(password);

        const check = `SELECT * FROM reservations WHERE locker_id = '${locker_id}'`;
        await mysql.query(check, async (err, result) => {
            if (result.length > 0) {
                res.status(400).json({ message: "Locker already reserved" });
            }
        })
        
        const insert = `INSERT INTO reservations (user_id, locker_id, password) values ('${user_id}', '${locker_id}', '${password}')`;
        await mysql.query(insert, (err, result) => {
            if (err) {
                res.status(400).json({ message: err.message });
            }
            res.status(200).json({ message: "Reservation locker complete" });
        })
        

    }catch(error){
        res.status(404).json({ message: error.message });
    }
}