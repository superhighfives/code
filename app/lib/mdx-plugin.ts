import { compile } from "@mdx-js/mdx";
import { readdirSync, readFileSync, statSync } from "fs";
import matter from "gray-matter";
import { resolve } from "path";
import remarkFrontmatter from "remark-frontmatter";
import type { Plugin } from "vite";
import type { MdxFile, MdxOptions } from "./mdx.server";

function findMdxFiles(dir: string): string[] {
  const files: string[] = [];

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = resolve(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...findMdxFiles(fullPath));
      } else if (entry.endsWith(".mdx") || entry.endsWith(".md")) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error("Error finding MDX files:", error);
    // Directory doesn't exist, return empty array
  }

  return files;
}

function transformFilePathToUrlPath(
  filePath: string,
  basePath: string,
  alias?: string,
): string {
  const relativePath = filePath
    .replace(basePath + "/", "")
    .replace(basePath + "\\", "");
  const urlPath = relativePath.replace(/\.mdx?$/, "").replace(/\\/g, "/");

  const finalAlias = alias || basePath.split("/").pop() || "posts";
  return `/${finalAlias}/${urlPath}`;
}

async function processFile(
  filePath: string,
): Promise<{ attributes: Record<string, any>; compiledSource: string }> {
  const content = readFileSync(filePath, "utf-8");
  const { data: attributes, content: mdxContent } = matter(content);

  const compiled = await compile(mdxContent, {
    outputFormat: "function-body",
    remarkPlugins: [remarkFrontmatter],
    development: false,
    jsxImportSource: "react",
  });

  return {
    attributes,
    compiledSource: String(compiled),
  };
}

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
      const options: MdxOptions = { path: "posts" }; // This could be configurable
      const paths =
        "path" in options && typeof options.path === "string"
          ? [options.path]
          : options.paths || [];

      if (paths.length === 0) return;

      const manifest: { files: MdxFile[] } = { files: [] };

      for (let pathIndex = 0; pathIndex < paths.length; pathIndex++) {
        const basePath = resolve(process.cwd(), paths[pathIndex]);
        const filePaths = findMdxFiles(basePath);

        for (const filePath of filePaths) {
          try {
            const { attributes, compiledSource } = await processFile(filePath);
            const urlPath = transformFilePathToUrlPath(filePath, basePath);
            const slug = filePath
              .replace(basePath + "/", "")
              .replace(basePath + "\\", "")
              .replace(/\.mdx?$/, "")
              .replace(/\\/g, "/");

            manifest.files.push({
              path: filePath,
              slug,
              urlPath,
              attributes,
              compiledSource,
            });
          } catch (error) {
            console.warn(`Failed to process MDX file: ${filePath}`, error);
          }
        }
      }

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
        const options: MdxOptions = { path: "posts" };
        const paths =
          "path" in options && typeof options.path === "string"
            ? [options.path]
            : options.paths || [];

        if (paths.length === 0) {
          return "export default { files: [] }";
        }

        const manifest: { files: MdxFile[] } = { files: [] };

        for (let pathIndex = 0; pathIndex < paths.length; pathIndex++) {
          const basePath = resolve(process.cwd(), paths[pathIndex]);
          const filePaths = findMdxFiles(basePath);

          for (const filePath of filePaths) {
            try {
              const { attributes, compiledSource } =
                await processFile(filePath);
              const urlPath = transformFilePathToUrlPath(filePath, basePath);
              const slug = filePath
                .replace(basePath + "/", "")
                .replace(basePath + "\\", "")
                .replace(/\.mdx?$/, "")
                .replace(/\\/g, "/");

              manifest.files.push({
                path: filePath,
                slug,
                urlPath,
                attributes,
                compiledSource,
              });
            } catch (error) {
              console.warn(`Failed to process MDX file: ${filePath}`, error);
            }
          }
        }

        return `export default ${JSON.stringify(manifest, null, 2)}`;
      }

      if (id === "virtual:mdx-routes") {
        const options: MdxOptions = { path: "posts" };
        const paths =
          "path" in options && typeof options.path === "string"
            ? [options.path]
            : options.paths || [];

        if (paths.length === 0) {
          return `import { route } from "@react-router/dev/routes";
export const mdxRoutes = [];`;
        }

        const routes = [];

        for (let pathIndex = 0; pathIndex < paths.length; pathIndex++) {
          const basePath = resolve(process.cwd(), paths[pathIndex]);
          const filePaths = findMdxFiles(basePath);

          for (const filePath of filePaths) {
            const urlPath = transformFilePathToUrlPath(filePath, basePath);
            routes.push({
              urlPath,
              id: urlPath.replace("/", ""),
            });
          }
        }

        return `import { route } from "@react-router/dev/routes";
export const mdxRoutes = [${routes
          .map(
            (r) =>
              `route("${r.urlPath}", "routes/posts.$.tsx", { id: "${r.id}" })`,
          )
          .join(",\n  ")}];`;
      }
    },
  };
}
