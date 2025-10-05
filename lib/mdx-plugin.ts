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
          urlPath: file.urlPath,
          id: file.urlPath.replace("/", ""),
        }));

        return `import { route } from "@react-router/dev/routes";
export const mdxRoutes = [${routes
          .map(
            (r) =>
              `route("${r.urlPath}", "routes/post.tsx", { id: "${r.id}" })`,
          )
          .join(",\n  ")}];`;
      }
    },
  };
}
