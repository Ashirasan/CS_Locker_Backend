import { ControllerModule } from "../modules/controller.module";
import { Request, Response } from "express";

export class DashboardController extends ControllerModule {
    
    async getdata(req:Request,res:Response){
        try{
            // count user
            const user_count  : any[] = await this.prisma.$queryRaw`SELECT COUNT(user_id) AS count FROM users`;

            // locker
            const locker_notuse_count: any[] = await this.prisma.$queryRaw`SELECT * FROM lockers WHERE lockers.locker_id NOT IN (SELECT locker_id FROM reservations)`
            
            // count per locker
            
            const lockerlist : any[] = await this.prisma.$queryRaw`SELECT * FROM lockers ORDER BY locker_num ASC`;
            
            res.status(200).json({
                user_count:Number(user_count[0].count),
                locker_notuse_count:locker_notuse_count,
                lockerlist:lockerlist,
            })
            

        }catch(error:any){
            res.status(500).json({message:error.message })
        }
    }
}