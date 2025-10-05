import { index, type RouteConfig, route } from "@react-router/dev/routes";
import { routes } from "./mdx/mdx-routes";

export default [
  index("routes/index.tsx"),
  route("about", "routes/about.tsx"),
  route("resources/theme-switch", "routes/resources/theme-switch.tsx"),
  route("resources/og-image/:slug", "routes/resources/og-image.tsx"),
  ...routes("routes/post.tsx"),
] satisfies RouteConfig;
