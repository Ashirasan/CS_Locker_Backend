import mysql from '../../connect.js';

export const data_dashboard = async (req, res) => {
     try {
         const query = 'SELECT records.*, records.date_start,records.date_end,users.name, lockers.locker_num,lockers.locker_status, TIMEDIFF(records.date_end, records.date_start) AS duration FROM records INNER JOIN users ON records.user_id = users.user_id INNER JOIN lockers ON records.locker_id = lockers.locker_id INNER JOIN reservations ON lockers.locker_id = reservations.locker_id  AND users.user_id = reservations.user_id;';
         mysql.query(query, (err, result) => {
            if(err){
                return res.status(400).json({ message: "error" });
            }

            const data = result.map((item) => {
                  return {
                     id: item.record_id,
                     user: item.name,
                     locker: item.locker_num,
                     status: item.locker_status,
                     start: item.date_start,
                     end: item.date_end,
                     duration: item.duration
                  };
               });
            res.status(200).json(data);;
         }
         );
       }
         catch (error) {
            res.status(404).json({ message: error.message });
         }
}


            