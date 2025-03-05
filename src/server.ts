require("dotenv").config();
// Express
import express from "express";
import { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
// Routes
import routes from "./routes";

// Server
interface ServerBlock {
  apiPrefix?: string;
}

export class Server {
  private app: Application;
  private port: number | null;

  constructor() {
    this.app = express();
    this.port = process.env.BACKEND_PORT
      ? Number(process.env.BACKEND_PORT)
      : null;
  }

  private loadMiddleware() {
    this.app.use(cors());
    this.app.use(bodyParser.json({ limit: "512mb" }));
    this.app.use(bodyParser.urlencoded({ limit: "512mb", extended: true }));
    this.app.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type"
      );
      res.setHeader("Access-Control-Allow-Credentials", "true");
      next();
    });
  }

  private loadRoutes(prefix: string = "/") {
    const router = express.Router();
    this.app.use(prefix, router);

    routes.forEach((route) => {
      const { prefix, routes } = route;
      const routeModule = new routes();
      router.use(prefix, routeModule.router);
    });
  }

  public start({ apiPrefix }: ServerBlock) {
    this.loadMiddleware();
    this.loadRoutes(apiPrefix);

    if (this.port) {
      this.app.listen(this.port, () => {
        console.log("API Server run at port: " + this.port);
      });
    } else {
      console.log("Please set PORT in .env file");
    }
  }
}

const server = new Server();
server.start({
  apiPrefix: "/api",
});
