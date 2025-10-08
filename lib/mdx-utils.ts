import { readdirSync, readFileSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import matter from "gray-matter";

export interface ContentFile<T = Record<string, unknown>> {
  path: string;
  slug: string;
  urlPath: string;
  attributes: T;
  rawContent: string;
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

export function transformFilePathToUrlPath(
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

  // Get the base directory name for comparison
  const baseDirectoryName = basePath.split("/").pop() || basePath.split("\\").pop() || "";

  // For posts, create clean URLs without the base path prefix
  if (baseDirectoryName === "posts" || alias === "posts") {
    return `/${slug}`;
  }

  // For other content, keep the original behavior
  const finalAlias = alias || baseDirectoryName || "posts";
  return `/${finalAlias}/${slug}`;
}

export function findMdxFiles(dir: string): string[] {
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

function transformObjectToMetaDataArray(obj: unknown): Array<{ key: string; value: string }> | undefined {
  if (!obj || typeof obj !== 'object') return undefined;

  return Object.entries(obj).map(([key, value]) => ({
    key,
    value: String(value),
  }));
}

export function processFile(filePath: string): {
  attributes: Record<string, unknown>;
  rawContent: string;
} {
  const content = readFileSync(filePath, "utf-8");
  const { data: attributes, content: mdxContent } = matter(content);

  // Extract date information from filename
  const filename =
    filePath.split("/").pop() || filePath.split("\\").pop() || "";
  const { slug, date, publishedAt } = parseFilenameParts(filename);

  // Merge filename data with frontmatter
  const mergedAttributes: Record<string, unknown> = {
    ...attributes,
    slug: attributes.slug || slug,
    publishedAt: attributes.publishedAt || publishedAt,
  };

  // Add date if extracted from filename (don't override frontmatter date)
  if (date && !attributes.date) {
    mergedAttributes.date = date.toISOString();
  }

  // Transform data and links objects to MetaData arrays
  if (mergedAttributes.data) {
    mergedAttributes.data = transformObjectToMetaDataArray(mergedAttributes.data);
  }
  if (mergedAttributes.links) {
    mergedAttributes.links = transformObjectToMetaDataArray(mergedAttributes.links);
  }

  return {
    attributes: mergedAttributes,
    rawContent: mdxContent,
  };
}

export async function processFileAsync(filePath: string): Promise<{
  attributes: Record<string, unknown>;
  rawContent: string;
}> {
  const content = await readFile(filePath, "utf-8");
  const { data: attributes, content: mdxContent } = matter(content);

  // Extract date information from filename
  const filename = filePath.split("/").pop() || "";
  const { slug, date, publishedAt } = parseFilenameParts(filename);

  // Merge filename data with frontmatter
  const mergedAttributes: Record<string, unknown> = {
    ...attributes,
    slug: attributes.slug || slug,
    publishedAt: attributes.publishedAt || publishedAt,
  };

  // Add date if extracted from filename (don't override frontmatter date)
  if (date && !attributes.date) {
    mergedAttributes.date = date.toISOString();
  }

  // Transform data and links objects to MetaData arrays
  if (mergedAttributes.data) {
    mergedAttributes.data = transformObjectToMetaDataArray(mergedAttributes.data);
  }
  if (mergedAttributes.links) {
    mergedAttributes.links = transformObjectToMetaDataArray(mergedAttributes.links);
  }

  return {
    attributes: mergedAttributes,
    rawContent: mdxContent,
  };
}

export interface ManifestOptions {
  path?: string;
  paths?: string[];
  alias?: string;
  aliases?: string[];
}

export function generateManifest(
  options?: ManifestOptions,
  addWatchFile?: (filePath: string) => void,
): { files: ContentFile[] } {
  // Default options if none provided
  const defaultOptions: ManifestOptions = { path: "posts" };
  const finalOptions = options || defaultOptions;
  const paths =
    "path" in finalOptions && typeof finalOptions.path === "string"
      ? [finalOptions.path]
      : finalOptions.paths || [];

  if (paths.length === 0) {
    return { files: [] };
  }

  const manifest: { files: ContentFile[] } = { files: [] };

  for (let pathIndex = 0; pathIndex < paths.length; pathIndex++) {
    const basePath = resolve(process.cwd(), paths[pathIndex]);
    const filePaths = findMdxFiles(basePath);

    for (const filePath of filePaths) {
      try {
        // Tell Vite to watch this MDX file for changes if callback provided
        addWatchFile?.(filePath);

        const { attributes, rawContent } = processFile(filePath);
        const urlPath = transformFilePathToUrlPath(filePath, basePath);

        // Use the slug from attributes (which includes filename parsing)
        const slug = `${
          attributes.slug ||
          filePath
            .replace(`${basePath}/`, "")
            .replace(`${basePath}\\`, "")
            .replace(/\.mdx?$/, "")
            .replace(/\\/g, "/")
        }`;

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

  return manifest;
}
