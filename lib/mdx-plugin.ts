import type { Plugin } from "vite";
import { generateManifest } from "./mdx-utils";

export function mdxPlugin(): Plugin {
  let isBuild = false;

  return {
    name: "mdx-manifest",
    configResolved(config) {
      isBuild = config.command === "build";
    },
    async buildStart() {
      // Only emit files during build, not dev
      if (!isBuild) return;

      // Generate MDX manifest during build
      const manifest = generateManifest(undefined, (filePath) =>
        this.addWatchFile(filePath),
      );

      if (manifest.files.length === 0) return;

      // Create virtual module
      this.emitFile({
        type: "asset",
        fileName: "mdx-manifest.json",
        source: JSON.stringify(manifest, null, 2),
      });
    },
    configureServer(server) {
      // Watch the posts directory for new/deleted files in dev mode
      server.watcher.add("posts/**/*.{md,mdx}");

      // Invalidate virtual modules when MDX files change
      server.watcher.on("add", (path) => {
        if (path.endsWith(".md") || path.endsWith(".mdx")) {
          const module = server.moduleGraph.getModuleById(
            "virtual:mdx-manifest",
          );
          if (module) {
            server.moduleGraph.invalidateModule(module);
          }
          const routesModule =
            server.moduleGraph.getModuleById("virtual:mdx-routes");
          if (routesModule) {
            server.moduleGraph.invalidateModule(routesModule);
          }
          server.ws.send({ type: "full-reload" });
        }
      });

      server.watcher.on("unlink", (path) => {
        if (path.endsWith(".md") || path.endsWith(".mdx")) {
          const module = server.moduleGraph.getModuleById(
            "virtual:mdx-manifest",
          );
          if (module) {
            server.moduleGraph.invalidateModule(module);
          }
          const routesModule =
            server.moduleGraph.getModuleById("virtual:mdx-routes");
          if (routesModule) {
            server.moduleGraph.invalidateModule(routesModule);
          }
          server.ws.send({ type: "full-reload" });
        }
      });
    },
    resolveId(id) {
      if (id === "virtual:mdx-manifest" || id === "virtual:mdx-routes") {
        return id;
      }
    },
    async load(id) {
      if (id === "virtual:mdx-manifest") {
        // Generate manifest for both dev and build
        const manifest = generateManifest(undefined, (filePath) =>
          this.addWatchFile(filePath),
        );

        return `export default ${JSON.stringify(manifest, null, 2)}`;
      }

      if (id === "virtual:mdx-routes") {
        const manifest = generateManifest();

        if (manifest.files.length === 0) {
          return `import { route } from "@react-router/dev/routes";
export const mdxRoutes = [];`;
        }

        const routes = manifest.files.map((file) => ({
          url: file.url,
          id: file.url.replace("/", ""),
        }));

        return `import { route } from "@react-router/dev/routes";
export const mdxRoutes = [${routes
          .map((r) => `route("${r.url}", "routes/post.tsx", { id: "${r.id}" })`)
          .join(",\n  ")}];`;
      }
    },
  };
}
