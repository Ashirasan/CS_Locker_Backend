import { AuthRouteModule } from "./routes/auth.route";
// import { HomeRouteModule } from "./routes/home.route";

const routes = [
  { prefix: "/auth", routes: AuthRouteModule },
  //   { prefix: "/home", routes: HomeRouteModule },
];

export default routes;
