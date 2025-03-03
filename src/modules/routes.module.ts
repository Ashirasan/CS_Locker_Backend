import { Router } from "express";
import { Middleware } from "./middleware.module";

export abstract class RouteModule {
  public router: Router;
  public middleware: Middleware;

  constructor() {
    this.router = Router();
    this.middleware = new Middleware();
    this.loadRoutes();
  }

  abstract loadRoutes(): void;
}
