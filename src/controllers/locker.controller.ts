import { ControllerModule } from "../modules/controller.module";
import { Request, Response } from "express";
import axios from "axios";


export class LockerController extends ControllerModule {
    async reservationLocker(req: Request, res: Response) {
        const locker_id: number = req.body.locker_id;
        const user_id: number = req.body.user_id;
        const password = (Math.floor(100000 + Math.random() * 900000)).toString();
        const date: Date = new Date();

        try {
            const checklocker: any[] = await this.prisma.$queryRaw`SELECT rsv_id FROM reservations WHERE locker_id = ${locker_id}`;
            if (checklocker.length === 0) {
                const reservation: any[] = await this.prisma.$queryRaw`INSERT INTO reservations (locker_id,user_id,password,date) VALUES(${locker_id},${user_id},${password},${date})`;
                res.status(200).json({ message: "reservation complete" });
            } else {
                res.status(400).json({ message: "this locker is already reserved" });
            }
        } catch (error) {
            res.status(500).json({ message: "cannot reserve locker" });
        }
    }

    async cancelLocker(req: Request, res: Response) {
        const rsv_id: number = parseInt(req.params.rsv_id)

        try {
            const checkrsv: any[] = await this.prisma.$queryRaw`SELECT * FROM reservations JOIN lockers ON reservations.locker_id = lockers.locker_id
            WHERE rsv_id = ${rsv_id}`;
            if (checkrsv.length === 0) {
                res.status(404).json({ message: "not found this reservations" });
            } else {
                console.log(checkrsv[0]);
                const qdelete: any[] = await this.prisma.$queryRaw`DELETE FROM reservations WHERE rsv_id = ${rsv_id}`;
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
            const locker: any[] = await this.prisma.$queryRaw`SELECT * FROM lockers`;
            if (locker.length === 0) {
                res.status(404).json({ message: "not have any locker leave" });
            } else {
                res.status(200).json(locker);
            }
        } catch (error) {
            res.status(500).json({ message: "cannot get locker" });
        }
    }



    //unlock form app
    async unlockLockerApp(req: Request, res: Response) {
        try {
            const rsv_id: number = parseInt(req.params.rsv_id);

            const checkrsv: any[] = await this.prisma.$queryRaw`SELECT * FROM reservations JOIN lockers ON reservations.locker_id = lockers.locker_id
            WHERE rsv_id = ${rsv_id}`;
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
            console.log(locker_num);
            console.log(password);
            const checkrsv: any[] = await this.prisma.$queryRaw`SELECT * FROM reservations JOIN lockers ON reservations.locker_id = lockers.locker_id
            WHERE lockers.locker_num = ${locker_num}`
            if (checkrsv.length === 0) {
                res.status(404).json({ message: "locker number " + locker_num + " not reserve" });
            } else {
                // console.log(checkrsv[0]);
                if (password == checkrsv[0].password) {
                    // can unlock
                    const message_toboard = {
                        "index": locker_num,
                        "unlock": 1
                    }
                    // console.log(process.env.MQTT_CLIENT_ID);
                    
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
                            "Authorization": "Device " + process.env.mqtt_client_id + ":" + process.env.mqtt_token,
                        },
                    })
                    res.status(400).json({ message: "password are wrong" });
                }
            }

        } catch (error) {
            res.status(500).json({ message: "cannot unlock locker" });
        }
    }
}