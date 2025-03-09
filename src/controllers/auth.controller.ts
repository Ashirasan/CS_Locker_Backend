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
    const ref: string = await makeid(6, "ref");
    const otp: string = await makeid(6, "otp");
    try {


      const check: any[] = await this.prisma
        .$queryRaw`SELECT * FROM users WHERE email = ${email}`;
      if (check.length === 0) {
        const result: any[] = await this.prisma
          .$queryRaw`INSERT INTO users (users.email,users.password,users.firstname,users.lastname,users.ref,users.otp,users.verify_status) 
          VALUES (${email}, ${bcryptPassword}, ${firstname},${lastname},${ref},${otp},${0})`;
        const id: any[] = await this.prisma.$queryRaw`SELECT LAST_INSERT_ID() AS user_id`;
        const user_id: number = Number(id[0].user_id);
        //send mail
        await this.mailer.sendMail(email,"รหัส OTP สำหรับยืนยันตัวแอพลิเคชั่น LOCK LOCK","<h1> รหัส OTP ของคุณคือ "+otp+"</h1></br><p> Reference Code "+ ref + "</p>")
        res.status(200).json({
          message: "Need to verify otp",
          userId: user_id,
          refCode: ref,
        });
      } else {
        if (check[0].verify_status == 1) {
          res.status(400).json({ message: "this email already used" });
        } else {
          const update: any[] = await this.prisma.$queryRaw`UPDATE users SET password = ${bcryptPassword} , firstname = ${firstname}, lastname = ${lastname}, ref = ${ref} , otp = ${otp} WHERE user_id = ${check[0].user_id}`
          await this.mailer.sendMail(email,"รหัส OTP สำหรับยืนยันตัวแอพลิเคชั่น LOCK LOCK","<h1> รหัส OTP ของคุณคือ "+otp+"</h1></br><p> Reference Code "+ ref + "</p>")
          res.status(200).json({
            message: "Need to verify otp",
            userId: check[0].user_id,
            refCode: ref,
          });
        }
      }
    } catch (error) {
      res.status(500).json({ message: "cannot create user" });
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
          if (checkemail[0].verify_status === 0) {
            const ref: string = await makeid(6, "ref");
            const otp: string = await makeid(6, "otp");
            const updateotp = await this.prisma.$queryRaw`UPDATE users SET ref = ${ref}, otp = ${otp} WHERE user_id = ${checkemail[0].user_id}`;
            await this.mailer.sendMail(email,"รหัส OTP สำหรับยืนยันตัวแอพลิเคชั่น LOCK LOCK","<h1> รหัส OTP ของคุณคือ "+otp+"</h1></br><p> Reference Code "+ ref + "</p>")
            res.status(200).json({
              message: "Need to verify otp",
              userId: checkemail[0].user_id,
              refCode: ref,
              verify_status: false
            });
          } else {
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
          }
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

  async verificationOTP(req: Request, res: Response) {
    try {
      let user_id: number = req.body.user_id;
      let ref: string = req.body.ref
      let otp: string = req.body.otp;

      const finduser: any[] = await this.prisma.$queryRaw`SELECT * FROM users WHERE user_id = ${user_id} AND ref = ${ref}`;
      if (finduser.length === 0) {
        res.status(404).json({ message: "user not found" });
      } else {
        if (finduser[0].otp == otp) {
          const updatestatus = await this.prisma.$queryRaw`UPDATE users SET verify_status = ${1},ref = ${null}, otp = ${null} WHERE user_id = ${user_id}`
          const token = jwt.sign(
            { id: finduser[0].user_id },
            String(process.env.SECRET_KEY)
          );
          res.status(200).json({
            message: "verification complete",
            user_id: finduser[0].user_id,
            email: finduser[0].email,
            firstname: finduser[0].firstname,
            lastname: finduser[0].lastname,
            token: token,
          });
        } else {
          res.status(400).json({ message: "verification fail" });
        }
      }
    } catch (error) {
      res.status(500).json({ message: "cannot verification" });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const user_id: number = Number(req.user?.id);
      const firstname: string = req.body.firstname;
      const lastname: string = req.body.lastname;

      const userdata: any[] = await this.prisma.$queryRaw`SELECT * FROM users WHERE user_id = ${user_id}`
      const update: any[] = await this.prisma.$queryRaw`UPDATE users SET firstname = ${firstname}, lastname = ${lastname} WHERE user_id = ${user_id}`;
      res.status(200).json({
        message: "update user complete",
        user_id: userdata[0].user_id,
        email: userdata[0].email,
        firstname: firstname,
        lastname: lastname,
      });
    } catch (error) {
      res.status(500).json({ message: "cannot update user" });
    }
  }

  async updatePassword(req: Request, res: Response) {
    try {
      const user_id: number = Number(req.user?.id);
      const oldpassword: string = req.body.oldpassword;
      const newpassword: string = req.body.newpassword;

      const finduser: any[] = await this.prisma.$queryRaw`SELECT password FROM users WHERE user_id = ${user_id}`;
      if (finduser.length === 0) {
        res.status(404).json({ message: "user not found" });
      } else {
        const checkpassword: boolean = await bcrypt.compare(
          oldpassword,
          finduser[0].password
        );
        if (checkpassword) {
          let bcryptPassword: string = await bcrypt.hash(
            newpassword,
            Number(process.env.BCRYPT_ROUNDS)
          );
          const update: any[] = await this.prisma.$queryRaw`UPDATE users SET password = ${bcryptPassword} WHERE user_id = ${user_id}`;
          res.status(200).json({ message: "update new password complete" });
        } else {
          res.status(400).json({ message: "old password not match" });
        }
      }

    } catch (error) {
      res.status(500).json({ message: "cannot update password" });
    }
  }
}



function makeid(length: number, type: string) {
  var result = [];
  var characters: string = "";
  if (type == "ref") {
    characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  } else if (type == "otp") {
    characters =
      "0123456789";
  }
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(
      characters.charAt(Math.floor(Math.random() * charactersLength))
    );
  }
  return result.join("");
}

