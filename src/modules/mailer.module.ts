import nodemailer from "nodemailer";
import { Transporter } from "nodemailer";

export class MailerModule {
  private smtp_host: string;
  private smtp_port: number;
  private smtp_user: string;
  private smtp_password: string;
  private smtp_from: string;
  private smtp_secure: boolean;

  private transporter: Transporter;

  constructor() {
    this.smtp_host = process.env.SMTP_HOST || "";
    this.smtp_port = Number(process.env.SMTP_PORT) || 587;
    this.smtp_user = process.env.SMTP_USER || "";
    this.smtp_password = process.env.SMTP_PASS || "";
    this.smtp_from = process.env.SMTP_FROM || "Mailer System";
    this.smtp_secure = process.env.SMTP_SECURE === "true";

    this.transporter = nodemailer.createTransport({
      host: this.smtp_host,
      port: this.smtp_port,
      secure: this.smtp_secure,
      auth: {
        user: this.smtp_user,
        pass: this.smtp_password,
      },
    });
  }

  public async sendMail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: this.smtp_from + " <" + this.smtp_user + ">",
        to: to,
        subject: subject,
        html: html,
      });
    } catch (error) {
      console.log(error);
    }
  }
}
