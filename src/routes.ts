import { AuthRouteModule } from "./routes/auth.route";
import { LockerRouteModule } from "./routes/locker.route";
import { RecordRouteModule } from "./routes/record.route";
// import { HomeRouteModule } from "./routes/home.route";

const routes = [
  { prefix: "/auth", routes: AuthRouteModule },
  { prefix: "/locker", routes: LockerRouteModule },
  { prefix: "/record", routes: RecordRouteModule }
  //   { prefix: "/home", routes: HomeRouteModule },
];

export default routes;
