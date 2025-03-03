import { ControllerModule } from "../modules/controller.module";
import { Request, Response } from "express";

export class AuthController extends ControllerModule {
  async userRegister(req: Request, res: Response) {
    // await this.prisma.<database_table>.<method>
  }

  async userLogin(req: Request, res: Response) {}

  async protected(req: Request, res: Response) {
    res.send("Protected route");
  }
}
