import { Router } from "express";

export abstract class RouteModule {
  public router: Router;

  constructor() {
    this.router = Router();
    this.loadRoutes();
  }

  abstract loadRoutes(): void;
}
