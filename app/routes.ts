import { index, type RouteConfig, route } from "@react-router/dev/routes";
import { routes } from "react-router-mdx/server";

export default [
  index("routes/index.tsx"),
  route("about", "routes/about.tsx"),
  route("resources/theme-switch", "routes/resources/theme-switch.tsx"),
  route("resources/og-image", "routes/resources/og-image.tsx"),
  ...routes("./routes/post.tsx"),
] satisfies RouteConfig;
