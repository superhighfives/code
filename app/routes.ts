import {
  index,
  type RouteConfig,
  route,
} from "@react-router/dev/routes";
import { routes } from "react-router-mdx/server";

export default [
  index("routes/index.tsx"),
  route("about", "routes/about.tsx"),
  ...routes("./routes/post.tsx")
] satisfies RouteConfig;
