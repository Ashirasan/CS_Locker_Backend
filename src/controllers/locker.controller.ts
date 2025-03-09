import { ControllerModule } from "../modules/controller.module";
import { Request, Response } from "express";
import axios from "axios";


export class LockerController extends ControllerModule {
    async reservationLocker(req: Request, res: Response) {
        const locker_id: number = req.body.locker_id;
        const user_id: number = Number(req.user?.id);
        const password = (Math.floor(100000 + Math.random() * 900000)).toString();
        const date: Date = new Date();
        try {
            const checklocker: any[] = await this.prisma.$queryRaw`SELECT rsv_id FROM reservations WHERE locker_id = ${locker_id}`;
            if (checklocker.length === 0) {
                const reservation: any[] = await this.prisma.$queryRaw`INSERT INTO reservations (locker_id,user_id,password,date) VALUES(${locker_id},${user_id},${password},${date})`;
                const addcount: any[] = await this.prisma.$queryRaw`update lockers SET locker_count = locker_count + ${1} WHERE locker_id = ${locker_id}`
                res.status(200).json({ message: "reservation complete" });
            } else {
                res.status(400).json({ message: "this locker is already reserved" });
            }
        } catch (error) {
            res.status(500).json({ message: "cannot reserve locker" });
        }
    }

    async cancelLocker(req: Request, res: Response) {
        const user_id:number = Number(req.user?.id);
        const locker_id:number = req.body.locker_id;
        try {
            
            const checkrsv: any[] = await this.prisma.$queryRaw`SELECT * FROM reservations JOIN lockers ON reservations.locker_id = lockers.locker_id
            WHERE reservations.user_id = ${user_id} AND reservations.locker_id = ${locker_id}`;
            
            
            if (checkrsv.length === 0) {
                res.status(404).json({ message: "not found this reservations" });
            } else {
                const qdelete: any[] = await this.prisma.$queryRaw`DELETE FROM reservations WHERE user_id = ${user_id} AND locker_id = ${locker_id}`;
                const date_end: Date = new Date();

                const record: any[] = await this.prisma.$queryRaw`INSERT INTO records (date_start,date_end,user_id,locker_id)
                VALUES (${checkrsv[0].date},${date_end},${checkrsv[0].user_id},${checkrsv[0].locker_id})`;
                res.status(200).json({ message: "cancel locker and update record complete" });
            }
        } catch (error) {
            res.status(500).json({ message: "cannot cancel locker" });
        }
    }

    async getLocker(req: Request, res: Response) {
        try {
            const locker: any[] = await this.prisma.$queryRaw`SELECT * FROM lockers WHERE lockers.locker_id NOT IN (SELECT locker_id FROM reservations)
            ORDER BY locker_num ASC`;
            if (locker.length === 0) {
                res.status(404).json({ message: "not have any locker leave" });
            } else {
                var result: any[] = [];
                for await (const element of locker) {
                    result.push({
                        lockerNumber: element.locker_num,
                        lockerID: element.locker_id,
                        isInUse: false,
                        passCode: "",
                        reserveDate: null,
                        endReserveDate: null,
                    })
                }
                res.status(200).json(result);
            }
        } catch (error) {
            res.status(500).json({ message: "cannot get locker" });
        }
    }

    async getReserveLocker(req: Request, res: Response) {
        try {
            const user_id: number = Number(req.user?.id);

            const reserve: any[] = await this.prisma.$queryRaw`SELECT * FROM reservations JOIN lockers ON reservations.locker_id = lockers.locker_id
            WHERE user_id = ${user_id}`
            if (reserve.length === 0) {
                res.status(200).json({ message: "not found reserve locker", data:[]});
            } else {
                var result: any[] = [];
                for await (const element of reserve) {
                    result.push({
                        lockerNumber: element.locker_num,
                        lockerID: element.locker_id,
                        isInUse: true,
                        passCode: element.password,
                        reserveDate: element.date,
                        endReserveDate: null,
                    })
                }
                res.status(200).json({data:result});
            }
        } catch (error) {
            res.status(500).json({ message: "cannot get reserve locker" });
        }
    }



    //unlock form app
    async unlockLockerApp(req: Request, res: Response) {
        try {
            const user_id: number = Number(req.user?.id);
            const locker_id: number = req.body.locker_id;

            const checkrsv: any[] = await this.prisma.$queryRaw`SELECT * FROM reservations JOIN lockers ON reservations.locker_id = lockers.locker_id
            WHERE reservations.user_id = ${user_id} AND reservations.locker_id = ${locker_id}`;
            if (checkrsv.length === 0) {
                res.status(404).json({ message: "reservation not found" });
            } else {
                // can unlock
                const message_toboard = {
                    "index": checkrsv[0].locker_num,
                    "unlock": 1
                }
                const response = await axios.put('https://api.netpie.io/v2/device/message?topic=locker%2Funlock', message_toboard, {
                    headers: {
                        "Authorization": "Device " + process.env.MQTT_CLIENT_ID + ":" + process.env.MQTT_TOKEN,
                    },
                })
                res.status(200).json({ message: "unlock complete" })
            }
        } catch (error) {
            res.status(500).json({ message: "cannot unlock locker" });
        }
    }

    //unlock form board
    async unlockLockerBoard(req: Request, res: Response) {
        try {
            const input: string = req.params.input;
            let countstar: number = 0;
            let locker_num: string = "";
            let password: string = "";

            for (let i = 0; i < input.length; i++) {
                if (input[i] === "*") countstar++;
                else if (countstar === 1) locker_num += input[i];
                else if (countstar === 2) password += input[i];
            }
            const checkrsv: any[] = await this.prisma.$queryRaw`SELECT * FROM reservations JOIN lockers ON reservations.locker_id = lockers.locker_id
            WHERE lockers.locker_num = ${locker_num}`
            if (checkrsv.length === 0) {
                res.status(404).json({ message: "locker number " + locker_num + " not reserve" });
            } else {
                if (password == checkrsv[0].password) {
                    // can unlock
                    const message_toboard = {
                        "index": locker_num,
                        "unlock": 1
                    }
                    const response = await axios.put('https://api.netpie.io/v2/device/message?topic=locker%2Funlock', message_toboard, {
                        headers: {
                            "Authorization": "Device " + process.env.MQTT_CLIENT_ID + ":" + process.env.MQTT_TOKEN,
                        },
                    })
                    res.status(200).json({ message: "unlock complete" })
                } else {

                    //cannot unlock
                    const message_toboard = {
                        "index": locker_num,
                        "unlock": 0
                    }
                    const response = await axios.put('https://api.netpie.io/v2/device/message?topic=locker%2Funlock', message_toboard, {
                        headers: {
                            "Authorization": "Device " + process.env.MQTT_CLIENT_ID + ":" + process.env.MQTT_TOKEN,
                        },
                    })
                    res.status(400).json({ message: "password are wrong" });
                }
            }

        } catch (error) {
            res.status(500).json({ message: "cannot unlock locker" });
        }
    }

    async getRecord(req: Request, res: Response) {
        try {
          const user_id: number = Number(req.user?.id);
    
          const record: any[] = await this.prisma.$queryRaw`SELECT * FROM records JOIN lockers ON records.locker_id = lockers.locker_id
            WHERE user_id = ${user_id}`;
          if (record.length === 0) {
            res.status(200).json({ message: "cannot find record",data:[] })
          } else {
            var result: any[] = [];
            for await (const element of record) {
              result.push({
                lockerNumber: element.locker_num,
                lockerID: element.locker_id,
                isInUse: false,
                passCode: "",
                reserveDate: element.date_start,
                endReserveDate: element.date_end,
              })
            }
            res.status(200).json({data:result});
          }
        } catch (error) {
          res.status(500).json({ message: "cannot get record" })
        }
    }
}