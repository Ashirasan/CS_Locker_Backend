import { ControllerModule } from "../modules/controller.module";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthController extends ControllerModule {
  async userRegister(req: Request, res: Response) {
    // await this.prisma.<database_table>.<method>
    let email: string = req.body.email;
    let password: string = req.body.password;
    let firstname: string = req.body.firstname;
    let lastname: string = req.body.lastname;
    let bcryptPassword: string = await bcrypt.hash(
      password,
      Number(process.env.BCRYPT_ROUNDS)
    );
    try {
      const check: string = await this.prisma
        .$queryRaw`SELECT email FROM users WHERE email = ${email}`;
      if (check.length === 0) {
        const result: any[] = await this.prisma
          .$queryRaw`INSERT INTO users (users.email,users.password,users.firstname,users.lastname) VALUES (${email}, ${bcryptPassword}, ${firstname},${lastname})`;
          console.log();
          const id : any[] = await this.prisma.$queryRaw`SELECT LAST_INSERT_ID() AS user_id`;
          console.log();
          const user_id : number = Number(id[0].user_id);
          const token = jwt.sign(
            { id: user_id},
            String(process.env.SECRET_KEY)
          );
          res.status(200).json({
            message: "Register complete",
            user_id: user_id,
            email: email,
            firstname: firstname,
            lastname: lastname,
            token: token,
          });
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
            firstname: checkemail[0].firstname,
            lastname: checkemail[0].lastname,
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
