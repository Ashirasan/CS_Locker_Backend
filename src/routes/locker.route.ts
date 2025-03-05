import { RouteModule } from "../modules/routes.module";
import { LockerController } from "../controllers/locker.controller";

export class LockerRouteModule extends RouteModule {
    private controller: LockerController = new LockerController();

    loadRoutes(): void {
        this.router.post("/reservation-locker",this.middleware.verifyAuth(),  (req, res) => 
            this.controller.reservationLocker(req,res)
        );
        this.router.delete("/cancel-locker/:rsv_id",this.middleware.verifyAuth(),  (req,res)=>
            this.controller.cancelLocker(req,res)
        );
        this.router.get("/get-locker", (req,res)=>
            this.controller.getLocker(req,res)
        );
        this.router.get("/get-reservelocker/:user_id",this.middleware.verifyAuth(), (req,res)=>
            this.controller.getReserveLocker(req,res)
        );

        //unlock
        //by app
        this.router.get("/unlock-locker-app/:rsv_id",this.middleware.verifyAuth(),  (req,res)=>
            this.controller.unlockLockerApp(req,res)
        );
        //by board
        this.router.get("/unlock-locker-board/:input", (req,res) =>
            this.controller.unlockLockerBoard(req,res)
        );

        this.router.get("/record-get/:user_id", this.middleware.verifyAuth(), (req,res)=>
            this.controller.getRecord(req,res)
        );
    }
}
