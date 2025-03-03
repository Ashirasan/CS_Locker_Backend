import { ControllerModule } from "../modules/controller.module";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthController extends ControllerModule {
  async userRegister(req: Request, res: Response) {
    // await this.prisma.<database_table>.<method>
    let email: string = req.body.email;
    let password: string = req.body.password;
    let name: string = req.body.name;
    let bcryptPassword: string = await bcrypt.hash(
      password,
      Number(process.env.BCRYPT_ROUNDS)
    );
    try {
      const check: string = await this.prisma
        .$queryRaw`SELECT email FROM users WHERE email = ${email}`;
      if (check.length === 0) {
        const result: Object = await this.prisma
          .$queryRaw`INSERT INTO users (users.email,users.password,users.name) VALUES (${email}, ${bcryptPassword}, ${name})`;
        res.status(200).json({ message: "register complete" });
      } else {
        res.status(400).json({ message: "this email is already used" });
      }
    } catch (error) {
      res.status(500).json({ message: "cannot create user" });
      // res.status(500).json({message:error});
    }
  }

  async userLogin(req: Request, res: Response) {
    let email: string = req.body.email;
    let password: string = req.body.password;

    try {
      const checkemail: any[] = await this.prisma
        .$queryRaw`SELECT * FROM users WHERE email = ${email}`;
      if (checkemail.length === 0) {
        res.status(404).json({ message: "Email not found" });
      } else {
        const checkpassword: boolean = await bcrypt.compare(
          password,
          checkemail[0].password
        );

        if (checkpassword) {
          const token = jwt.sign(
            { id: checkemail[0].user_id },
            String(process.env.SECRET_KEY)
          );
          res.status(200).json({
            message: "login complete",
            user_id: checkemail[0].user_id,
            email: checkemail[0].email,
            name: checkemail[0].name,
            token: token,
          });
        } else {
          res.status(400).json({ message: "Email or Password is wrong" });
        }
      }
    } catch (error) {
      res.status(500).json({ message: "cannot login" });
    }
  }

  async protected(req: Request, res: Response) {
    res.send("Protected route");
  }
}
