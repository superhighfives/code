import type { Config } from "@react-router/dev/config";
import { init } from "./app/lib/mdx-routes.js";

init({ path: "posts" });

export default {
  ssr: true,
  routeDiscovery: { mode: "initial" },
  future: {
    unstable_viteEnvironmentApi: true,
  },
} satisfies Config;
