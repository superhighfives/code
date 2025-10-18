import { createRequestHandler } from "react-router";
import { KudosObject } from "./kudos-object";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
    assets: Fetcher;
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  fetch(request, env, ctx) {
    return requestHandler(request, {
      cloudflare: { env, ctx },
      assets: env.ASSETS,
    });
  },
} satisfies ExportedHandler<Env>;

export { KudosObject };

if (import.meta.hot) {
  import.meta.hot.accept();
}
