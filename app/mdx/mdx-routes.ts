import { route } from "@react-router/dev/routes";
import {
  generateMdxManifest,
  generateMdxManifestSync,
  getMdxFileByUrl,
  processMdxFile,
} from "./mdx.server";

export async function routesAsync(componentPath: string) {
  const manifest = await generateMdxManifest();
  return manifest.files.map((file) =>
    route(file.urlPath, componentPath, {
      id: file.slug,
    }),
  );
}

export function routes(componentPath: string) {
  const manifest = generateMdxManifestSync();
  return manifest.files.map((file) =>
    route(file.urlPath, componentPath, {
      id: file.slug,
    }),
  );
}

export async function loadMdx(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const mdxFile = await getMdxFileByUrl(pathname);

  if (!mdxFile) {
    throw new Response("Not Found", { status: 404 });
  }

  let rawContent = mdxFile.rawContent;

  if (!rawContent) {
    const result = await processMdxFile(mdxFile.path);
    rawContent = result.rawContent;
  }

  return {
    __raw: rawContent,
    attributes: mdxFile.attributes,
  };
}

export async function loadAllMdx() {
  const manifest = await generateMdxManifest();
  return manifest.files.map((file) => ({
    path: file.path,
    slug: file.slug,
    ...file.attributes,
  }));
}
