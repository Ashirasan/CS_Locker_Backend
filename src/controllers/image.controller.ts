import { Request,Response } from "express";
import { ControllerModule } from "../modules/controller.module";

export class ImageController extends ControllerModule {

    async getImageUrl(req:Request,res:Response){
        try{
            const url : any[] = await this.prisma.$queryRaw`SELECT * FROM homepage_image`;
            res.status(200).json({url:url});
        }catch(error){
            res.status(500).json({message:"cannot get image url"});
        }
    }

}