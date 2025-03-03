import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

export class ControllerModule {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }
}
