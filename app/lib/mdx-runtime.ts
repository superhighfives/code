import manifest from "virtual:mdx-manifest";
import type { MdxFile } from "./mdx.server";
import type { MdxRuntimeData, Post } from "./types";

export async function getRuntimeMdxManifest(): Promise<{ files: MdxFile[] }> {
  return manifest;
}

export async function loadMdxRuntime(
  request: Request,
): Promise<MdxRuntimeData> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const { files } = await getRuntimeMdxManifest();
  const mdxFile = files.find(
    (file) =>
      file.urlPath === pathname || file.urlPath === pathname.replace(/\/$/, ""),
  );

  if (!mdxFile) {
    throw new Response("Not Found", { status: 404 });
  }

  return {
    content: mdxFile.rawContent,
    frontmatter: mdxFile.attributes,
  };
}

export async function loadAllMdxRuntime(
  filterByPaths?: string[],
): Promise<Post[]> {
  const { files } = await getRuntimeMdxManifest();

  let filteredFiles = files;

  if (filterByPaths && filterByPaths.length > 0) {
    filteredFiles = files.filter((file) =>
      filterByPaths.some((path) => file.urlPath.startsWith(`/${path}/`)),
    );
  }

  return filteredFiles.map((file): Post => {
    const { attributes } = file;
    const date = attributes.date ? new Date(attributes.date) : undefined;

    return {
      path: file.path,
      slug: file.slug,
      urlPath: file.urlPath,
      title: attributes.title || "Untitled",
      description: attributes.description,
      author: attributes.author,
      publishedAt: attributes.publishedAt,
      date,
      tags: attributes.tags,
      frontmatter: attributes,
    };
  });
}

export function getMdxRoutesRuntime() {
  // Return a synchronous function that returns routes based on build-time manifest
  // This will be used by the routes.ts file
  return []; // We'll need to handle this differently
}
