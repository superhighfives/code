import { index, type RouteConfig, route } from "@react-router/dev/routes";
import { routes } from "./mdx/mdx-routes";

export default [
  index("routes/index.tsx"),
  route("theme-switch", "routes/resources/theme-switch.tsx"),
  route(":slug.png", "routes/resources/og-image.tsx"),
  route("rss", "routes/resources/rss.tsx"),
  ...routes("routes/post.tsx"),
  route("*", "routes/404.tsx"),
] satisfies RouteConfig;
