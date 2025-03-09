import { ImageController } from "../controllers/image.controller";
import { RouteModule } from "../modules/routes.module";

export class ImageRouteModule extends RouteModule{
    private controller : ImageController = new ImageController();
    loadRoutes(): void {
        this.router.get("/get-image",(req,res)=>(
            this.controller.getImageUrl(req,res)
        ));
    }
}