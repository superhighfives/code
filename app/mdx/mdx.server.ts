import { relative, resolve } from "node:path";
import { glob, globSync } from "glob";
import {
  processFile,
  processFileAsync,
  transformFilePathToUrlPath,
} from "../../lib/mdx-utils";
import type { MdxFile, MdxManifest, PostFrontmatter } from "./types";

// Hardcode to use "posts" path

const POSTS_PATH = "posts";

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
  const { attributes, rawContent } = await processFileAsync(filePath);
  return {
    attributes: attributes as PostFrontmatter,
    rawContent,
  };
}

export function processMdxFileSync(filePath: string): {
  attributes: PostFrontmatter;
} {
  const { attributes } = processFile(filePath);
  return { attributes: attributes as PostFrontmatter };
}

export async function generateMdxManifest(): Promise<MdxManifest> {
  const pathsFiles = await listMdxFiles([POSTS_PATH]);
  const files: MdxFile[] = [];

  for (const filePath of pathsFiles[0]) {
    const { attributes, rawContent } = await processMdxFile(filePath);
    const urlPath = transformFilePathToUrlPath(
      filePath,
      resolve(process.cwd(), POSTS_PATH),
    );

    // Use the slug from attributes (which includes filename parsing)
    const slug =
      attributes.slug ||
      relative(resolve(process.cwd(), POSTS_PATH), filePath)
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

  return { files };
}

export function generateMdxManifestSync(): MdxManifest {
  const pathsFiles = listMdxFilesSync([POSTS_PATH]);
  const files: MdxFile[] = [];

  if (!pathsFiles[0] || pathsFiles[0].length === 0) {
    return { files: [] };
  }

  for (const filePath of pathsFiles[0]) {
    const { attributes } = processMdxFileSync(filePath);
    const urlPath = transformFilePathToUrlPath(
      filePath,
      resolve(process.cwd(), POSTS_PATH),
    );

    // Use the slug from attributes (which includes filename parsing)
    const slug =
      attributes.slug ||
      relative(resolve(process.cwd(), POSTS_PATH), filePath)
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
