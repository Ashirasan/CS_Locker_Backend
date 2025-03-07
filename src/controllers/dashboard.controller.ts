import { ControllerModule } from "../modules/controller.module";
import { Request, Response } from "express";

export class DashboardController extends ControllerModule {
    
    async getdata(req:Request,res:Response){
        try{
            // count user
            const user_count  : any[] = await this.prisma.$queryRaw`SELECT COUNT(user_id) AS count FROM users`;

            // locker
            const locker_all_count : any[] = await this.prisma.$queryRaw`SELECT COUNT(locker_id) AS count FROM lockers `;
            const locker_notuse_count: any[] = await this.prisma.$queryRaw`SELECT COUNT(locker_id) AS count FROM lockers WHERE lockers.locker_id NOT IN (SELECT locker_id FROM reservations)`
            console.log(locker_all_count);
            
            // count per locker
            const record_count : any[] = await this.prisma.$queryRaw`SELECT * FROM  records JOIN lockers ON records.locker_id = lockers.locker_id`;
            const reserve_count : any[] = await this.prisma.$queryRaw`SELECT * FROM  reservations JOIN lockers ON reservations.locker_id = lockers.locker_id`;
            // let lockerList: number[] = new Array(Number(locker_all_count[0].count));
            // lockerList[1] = 2;
            
            
            res.status(200).json({
                user_count:Number(user_count[0].count),
                locker_all_count:Number(locker_all_count[0].count),
                locker_notuse_count:Number(locker_notuse_count[0].count),
                record_count:record_count,
                reserve_count:reserve_count,
            })
            

        }catch(error:any){
            res.status(500).json({message:error.message })
        }
    }
}