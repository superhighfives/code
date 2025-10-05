import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { glob, globSync } from "glob";
import matter from "gray-matter";
import type {
  MdxFile,
  MdxManifest,
  MdxOptions,
  PostFrontmatter,
} from "./types";

let options: MdxOptions = {};

export function setOptions(newOptions: MdxOptions) {
  options = newOptions;
}

export function getOptions(): MdxOptions {
  return options;
}

function getAliases(options: MdxOptions) {
  if ("alias" in options && options.alias) {
    return [options.alias];
  }
  if ("aliases" in options && options.aliases) {
    return options.aliases;
  }
  return undefined;
}

function getPaths(options: MdxOptions): string[] {
  if ("path" in options && typeof options.path === "string") {
    return [options.path];
  }
  return options.paths || [];
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
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
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
  const relativePath = relative(resolve(process.cwd(), basePath), filePath);
  const filename = relativePath.replace(/\\/g, "/");

  // Parse filename to extract clean slug
  const { slug } = parseFilenameParts(filename);

  // For posts, create clean URLs without the base path prefix
  if (basePath === "posts" || alias === "posts") {
    return `/${slug}`;
  }

  // For other content, keep the original behavior
  const finalAlias = alias || basePath;
  return `/${finalAlias}/${slug}`;
}

export async function listMdxFiles(paths: string[]): Promise<string[][]> {
  const allFilesPromises = paths.map(async (path: string) => {
    const pattern = resolve(process.cwd(), path, "**", "*.{md,mdx}");
    return glob(pattern, { windowsPathsNoEscape: true });
  });

  return Promise.all(allFilesPromises);
}

export function listMdxFilesSync(paths: string[]): string[][] {
  return paths.map((path) => {
    const pattern = resolve(process.cwd(), path, "**", "*.{md,mdx}");
    return globSync(pattern, { windowsPathsNoEscape: true });
  });
}

export async function processMdxFile(
  filePath: string,
): Promise<{ attributes: PostFrontmatter; rawContent: string }> {
  const content = await readFile(filePath, "utf-8");
  const { data: attributes, content: mdxContent } = matter(content);

  // Extract date information from filename
  const filename = filePath.split("/").pop() || "";
  const { slug, publishedAt } = parseFilenameParts(filename);

  // Merge filename data with frontmatter
  const mergedAttributes: PostFrontmatter = {
    ...attributes,
    slug: attributes.slug || slug,
    publishedAt: attributes.publishedAt || publishedAt,
  };

  return {
    attributes: mergedAttributes,
    rawContent: mdxContent,
  };
}

export function processMdxFileSync(filePath: string): {
  attributes: PostFrontmatter;
} {
  const content = readFileSync(filePath, "utf-8");
  const { data: attributes } = matter(content);

  // Extract date information from filename
  const filename = filePath.split("/").pop() || "";
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

  return { attributes: mergedAttributes };
}

export async function generateMdxManifest(): Promise<MdxManifest> {
  const paths = getPaths(options);
  const aliases = getAliases(options);

  if (paths.length === 0) {
    throw new Error("No MDX paths configured. Use init() to set up paths.");
  }

  const pathsFiles = await listMdxFiles(paths);

  const files: MdxFile[] = [];

  for (let pathIndex = 0; pathIndex < pathsFiles.length; pathIndex++) {
    const pathFiles = pathsFiles[pathIndex];
    const basePath = paths[pathIndex];
    const alias = aliases?.[pathIndex];

    for (const filePath of pathFiles) {
      const { attributes, rawContent } = await processMdxFile(filePath);
      const urlPath = transformFilePathToUrlPath(filePath, basePath, alias);

      // Use the slug from attributes (which includes filename parsing)
      const slug =
        attributes.slug ||
        relative(resolve(process.cwd(), basePath), filePath)
          .replace(/\.mdx?$/, "")
          .replace(/\\/g, "/");

      files.push({
        path: filePath,
        slug,
        urlPath,
        attributes,
        rawContent,
      });
    }
  }

  return { files };
}

export function generateMdxManifestSync(): MdxManifest {
  const paths = getPaths(options);
  const aliases = getAliases(options);

  if (paths.length === 0) {
    throw new Error("No MDX paths configured. Use init() to set up paths.");
  }

  const pathsFiles = listMdxFilesSync(paths);

  const files: MdxFile[] = [];

  for (let pathIndex = 0; pathIndex < pathsFiles.length; pathIndex++) {
    const pathFiles = pathsFiles[pathIndex];
    const basePath = paths[pathIndex];
    const alias = aliases?.[pathIndex];

    for (const filePath of pathFiles) {
      const { attributes } = processMdxFileSync(filePath);
      const urlPath = transformFilePathToUrlPath(filePath, basePath, alias);

      // Use the slug from attributes (which includes filename parsing)
      const slug =
        attributes.slug ||
        relative(resolve(process.cwd(), basePath), filePath)
          .replace(/\.mdx?$/, "")
          .replace(/\\/g, "/");

      files.push({
        path: filePath,
        slug,
        urlPath,
        attributes,
        rawContent: "", // Will be loaded when needed
      });
    }
  }

  return { files };
}

export async function getMdxFileByUrl(
  url: string,
): Promise<MdxFile | undefined> {
  const manifest = await generateMdxManifest();
  return manifest.files.find(
    (file) => file.urlPath === url || file.urlPath === url.replace(/\/$/, ""),
  );
}

export function getMdxFileByUrlSync(url: string): MdxFile | undefined {
  const manifest = generateMdxManifestSync();
  return manifest.files.find(
    (file) => file.urlPath === url || file.urlPath === url.replace(/\/$/, ""),
  );
}
