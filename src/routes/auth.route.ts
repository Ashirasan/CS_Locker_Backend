import { RouteModule } from "../modules/routes.module";
import { AuthController } from "../controllers/auth.controller";

export class AuthRouteModule extends RouteModule {
  private controller: AuthController = new AuthController();

  loadRoutes(): void {
    this.router.post("/user-register", (req, res) =>
      this.controller.userRegister(req, res)
    );

    this.router.post("/user-login", (req, res) =>
      this.controller.userLogin(req, res)
    );

    this.router.get("/protected", this.middleware.verifyAuth(), (req, res) =>
      this.controller.protected(req, res)
    );
  }
}
