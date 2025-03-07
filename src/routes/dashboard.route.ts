import { RouteModule } from "../modules/routes.module";
import { DashboardController } from "../controllers/dashboard.controller";

export class DashboardRouteModule extends RouteModule {
    private controller: DashboardController = new DashboardController();

    loadRoutes(): void {
        this.router.get("/getdata",(req,res)=>(
            this.controller.getdata(req,res)
        ));
    }
}