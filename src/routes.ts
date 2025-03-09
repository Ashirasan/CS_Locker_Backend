import { AuthRouteModule } from "./routes/auth.route";
import { LockerRouteModule } from "./routes/locker.route";
import { DashboardRouteModule } from "./routes/dashboard.route";
import { ImageRouteModule } from "./routes/image.route";
// import { HomeRouteModule } from "./routes/home.route";

const routes = [
  { prefix: "/auth", routes: AuthRouteModule },
  { prefix: "/locker", routes: LockerRouteModule },
  { prefix: "/dashboard", routes: DashboardRouteModule },
  { prefix: "/image", routes: ImageRouteModule}
  //   { prefix: "/home", routes: HomeRouteModule },
];

export default routes;
