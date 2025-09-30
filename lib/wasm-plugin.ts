// @ts-check

import * as fs from "fs";
import * as path from "path";
import type { Plugin, ResolvedConfig } from "vite";

type LoadResult = string | null;

export default function wasmModuleWorkers(): Plugin {
  let isDev = false;

  return {
    name: "vite:wasm-helper",
    enforce: 'pre',
    configResolved(config: ResolvedConfig) {
      isDev = config.command === "serve";
    },
    resolveId(id: string) {
      // Handle Cloudflare transformed WASM URLs
      if (id.includes("__CLOUDFLARE_MODULE__") && id.includes(".wasm")) {
        const match = id.match(/__CLOUDFLARE_MODULE__CompiledWasm__(.*?)__CLOUDFLARE_MODULE__(.*)/);
        if (match?.[1]) {
          const originalPath = match[1];
          const suffix = match[2] || "";
          return originalPath + suffix;
        }
      }
      return null;
    },
    load(id: string): LoadResult {
      // Handle both ?url imports and ?module dynamic imports of wasm files
      if (id.includes(".wasm")) {
        let filePath = id;
        let isModuleImport = false;

        // Check if this is a ?module dynamic import
        if (id.includes("?module")) {
          isModuleImport = true;
          filePath = filePath.replace(/\?module$/, "");
        } else if (id.includes("?url")) {
          // Handle ?url imports that get transformed by Cloudflare
          filePath = filePath.replace(/\?url$/, "");
        }

        // Handle Cloudflare module transformations
        if (filePath.includes("__CLOUDFLARE_MODULE__")) {
          const match = filePath.match(/__CLOUDFLARE_MODULE__CompiledWasm__(.*?)__CLOUDFLARE_MODULE__/);
          if (match?.[1]) {
            filePath = match[1];
          }
        }

        // Resolve relative paths
        if (!path.isAbsolute(filePath)) {
          filePath = path.resolve(filePath);
        }

        if (!fs.existsSync(filePath)) {
          return null;
        }

        if (isModuleImport) {
          // Handle ?module imports for WebAssembly.Module
          if (isDev) {
            return `
              import fs from "fs"
              const wasmModule = new WebAssembly.Module(fs.readFileSync("${filePath}"));
              export default wasmModule;
            `;
          }

          // For production, emit the WASM file as an asset and return a module
          const assetId = this.emitFile({
            type: "asset",
            name: path.basename(filePath),
            source: fs.readFileSync(filePath),
          });

          return `
            const wasmUrl = new URL("__VITE_ASSET__${assetId}__", import.meta.url);
            const wasmModule = new WebAssembly.Module(await fetch(wasmUrl).then(r => r.arrayBuffer()));
            export default wasmModule;
          `;
        } else {
          // Handle ?url imports to provide the file URL
          const assetId = this.emitFile({
            type: "asset",
            name: path.basename(filePath),
            source: fs.readFileSync(filePath),
          });

          return `
            export default "__VITE_ASSET__${assetId}__";
          `;
        }
      }

      return null;
    },
  };
}
