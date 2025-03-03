import { RouteModule } from "../modules/routes.module";
import { RecordController } from "../controllers/record.controller";

export class RecordRouteModule extends RouteModule {
  private controller: RecordController = new RecordController();
  loadRoutes(): void {
    this.router.get("/record-get/:user_id",(req,res)=>
      this.controller.getRecord(req,res)
    );
    // this.router.post("/user-register", (req, res) =>
    //   this.controller.userRegister(req, res)
    // );

    // this.router.post("/user-login", (req, res) =>
    //   this.controller.userLogin(req, res)
    // );
  }
}
