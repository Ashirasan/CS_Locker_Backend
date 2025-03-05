import { MailerModule } from "./mailer.module";
import { PrismaClient } from "@prisma/client";

export class ControllerModule {
  protected prisma: PrismaClient;
  protected mailer: MailerModule;

  constructor() {
    this.prisma = new PrismaClient();
    this.mailer = new MailerModule();
  }
}
