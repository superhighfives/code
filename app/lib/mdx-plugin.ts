import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import type { Plugin } from "vite";
import type { MdxFile, MdxOptions } from "./mdx.server";
import type { PostFrontmatter } from "./types";

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

function parseFilenameParts(filename: string): {
  slug: string;
  date?: Date;
  publishedAt?: string;
} {
  // Check if filename matches YYYY-MM-DD.slug.mdx pattern
  const dateSlugMatch = filename.match(/^(\d{4})-(\d{2})-(\d{2})\.(.+)\.mdx?$/);

  if (dateSlugMatch) {
    const [, year, month, day, slug] = dateSlugMatch;
    const date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
    );
    const publishedAt = `${year}-${month}-${day}`;
    return { slug, date, publishedAt };
  }

  // Fallback to regular filename parsing
  const slug = filename.replace(/\.mdx?$/, "");
  return { slug };
}

function transformFilePathToUrlPath(
  filePath: string,
  basePath: string,
  alias?: string,
): string {
  const relativePath = filePath
    .replace(`${basePath}/`, "")
    .replace(`${basePath}\\`, "");
  const filename = relativePath.replace(/\\/g, "/");

  // Parse filename to extract clean slug
  const { slug } = parseFilenameParts(filename);

  // For posts, create clean URLs without the base path prefix
  if (basePath.endsWith("posts") || alias === "posts") {
    return `/${slug}`;
  }

  // For other content, keep the original behavior
  const finalAlias = alias || basePath.split("/").pop() || "posts";
  return `/${finalAlias}/${slug}`;
}

function processFile(filePath: string): {
  attributes: PostFrontmatter;
  rawContent: string;
} {
  const content = readFileSync(filePath, "utf-8");
  const { data: attributes, content: mdxContent } = matter(content);

  // Extract date information from filename
  const filename =
    filePath.split("/").pop() || filePath.split("\\").pop() || "";
  const { slug, date, publishedAt } = parseFilenameParts(filename);

  // Merge filename data with frontmatter
  const mergedAttributes: PostFrontmatter = {
    ...attributes,
    slug: attributes.slug || slug,
    publishedAt: attributes.publishedAt || publishedAt,
  };

  // Add date if extracted from filename (don't override frontmatter date)
  if (date && !attributes.date) {
    mergedAttributes.date = date.toISOString();
  }

  return {
    attributes: mergedAttributes,
    rawContent: mdxContent,
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
            // Tell Vite to watch this MDX file for changes
            this.addWatchFile(filePath);

            const { attributes, rawContent } = processFile(filePath);
            const urlPath = transformFilePathToUrlPath(filePath, basePath);

            // Use the slug from attributes (which includes filename parsing)
            const slug =
              attributes.slug ||
              filePath
                .replace(basePath + "/", "")
                .replace(basePath + "\\", "")
                .replace(/\.mdx?$/, "")
                .replace(/\\/g, "/");

            manifest.files.push({
              path: filePath,
              slug,
              urlPath,
              attributes,
              rawContent,
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
              // Tell Vite to watch this MDX file for changes
              this.addWatchFile(filePath);

              const { attributes, rawContent } = processFile(filePath);
              const urlPath = transformFilePathToUrlPath(filePath, basePath);

              // Use the slug from attributes (which includes filename parsing)
              const slug =
                attributes.slug ||
                filePath
                  .replace(basePath + "/", "")
                  .replace(basePath + "\\", "")
                  .replace(/\.mdx?$/, "")
                  .replace(/\\/g, "/");

              manifest.files.push({
                path: filePath,
                slug,
                urlPath,
                attributes,
                rawContent,
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
