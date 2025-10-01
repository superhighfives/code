// @ts-check

import * as fs from "fs";
import * as path from "path";
import type { Plugin, ResolvedConfig } from "vite";

type LoadResult = string | null;

export default function wasmModuleWorkers(): Plugin {
  let isDev = false;

  return {
    name: "vite:wasm-helper",
    enforce: "pre",
    configResolved(config: ResolvedConfig) {
      isDev = config.command === "serve";
    },
    resolveId(id: string) {
      // Handle Cloudflare transformed WASM URLs by returning a virtual module ID
      if (id.includes("__CLOUDFLARE_MODULE__") && id.includes(".wasm")) {
        // Return the original ID to handle in load()
        return id;
      }
      return null;
    },
    load(id: string): LoadResult {
      // Handle Cloudflare transformed WASM imports
      if (id.includes("__CLOUDFLARE_MODULE__") && id.includes(".wasm")) {
        const match = id.match(
          /__CLOUDFLARE_MODULE__CompiledWasm__(.*?)__CLOUDFLARE_MODULE__(.*)/,
        );
        if (match?.[1]) {
          const originalPath = match[1];
          const suffix = match[2] || "";

          // If it's a ?url import, transform to ?module and delegate to Cloudflare
          if (suffix === "?url") {
            const moduleId = `${originalPath}?module`;
            // Import the ?module version and re-export it
            return `export { default } from "${moduleId}";`;
          }
        }
      }

      return null;
    },
  };
}
