import { RouteModule } from "../modules/routes.module";
import { LockerController } from "../controllers/locker.controller";

export class LockerRouteModule extends RouteModule {
    private controller: LockerController = new LockerController();
    
    loadRoutes(): void {
        this.router.post("/reservation-locker",this.middleware.verifyAuth(),  (req, res) => 
            this.controller.reservationLocker(req,res)
        );
        this.router.post("/cancel-locker",this.middleware.verifyAuth(),  (req,res)=>
            this.controller.cancelLocker(req,res)
        );
        this.router.get("/get-locker", (req,res)=>
            this.controller.getLocker(req,res)
        );
        this.router.get("/get-reservelocker",this.middleware.verifyAuth(), (req,res)=>
            this.controller.getReserveLocker(req,res)
        );

        //unlock
        //by app
        this.router.post("/unlock-locker-app",this.middleware.verifyAuth(),  (req,res)=>
            this.controller.unlockLockerApp(req,res)
        );
        //by board
        this.router.get("/unlock-locker-board/:input", (req,res) =>
            this.controller.unlockLockerBoard(req,res)
        );

        this.router.get("/record-get", this.middleware.verifyAuth(), (req,res)=>
            this.controller.getRecord(req,res)
        );
    }
}
