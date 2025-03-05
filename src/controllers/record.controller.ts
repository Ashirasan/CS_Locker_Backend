import { ControllerModule } from "../modules/controller.module";
import { Request, Response } from "express";

export class RecordController extends ControllerModule {
    async getRecord(req: Request, res: Response) {
        try {
            const user_id: number = parseInt(req.params.user_id);

            const record: any[] = await this.prisma.$queryRaw`SELECT * FROM records JOIN lockers ON records.locker_id = lockers.locker_id
            WHERE user_id = ${user_id}`;
            if (record.length === 0) {
                res.status(404).json({ message: "cannot find record" })
            } else {
                var result: any[] = [];
                for await (const element of record) {
                    // console.log(element);
                    result.push({
                        lockerNumber: element.locker_num,
                        lockerID: element.locker_id,
                        isInUse: false,
                        passCode: "",
                        reserveDate: element.date_start,
                        endReserveDate: element.date_end,
                    })
                }
                res.status(200).json(result);
            }
        } catch (error) {
            res.status(500).json({ message: "cannot get record" })
        }
    }
}