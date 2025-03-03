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
                console.log(record);
                res.status(200).json({
                    message: "get record complete",
                    record: record
                });
            }
        } catch (error) {
            res.status(500).json({ message: "cannot get record" })
        }
    }
}