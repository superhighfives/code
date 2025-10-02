import { route } from "@react-router/dev/routes";
import {
  generateMdxManifest,
  generateMdxManifestSync,
  getMdxFileByUrl,
  getOptions,
  type MdxOptions,
  processMdxFile,
  setOptions,
} from "./mdx.server";

export function init(options: MdxOptions) {
  setOptions(options);
  return {
    async paths(): Promise<string[]> {
      const manifest = await generateMdxManifest();
      return manifest.files.map((file) => file.urlPath);
    },
  };
}

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

export async function loadMdx(request: Request, explicitOptions?: MdxOptions) {
  if (explicitOptions) {
    setOptions(explicitOptions);
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  const mdxFile = await getMdxFileByUrl(pathname);

  if (!mdxFile) {
    throw new Response("Not Found", { status: 404 });
  }

  let compiledSource = mdxFile.compiledSource;

  if (!compiledSource) {
    const result = await processMdxFile(mdxFile.path);
    compiledSource = result.compiledSource;
  }

  return {
    __raw: compiledSource,
    attributes: mdxFile.attributes,
  };
}

export async function loadAllMdx(
  filterByPaths?: string[],
  explicitOptions?: MdxOptions,
) {
  const options = explicitOptions || getOptions();
  const paths =
    "path" in options && typeof options.path === "string"
      ? [options.path]
      : options.paths || [];

  if (paths.length === 0) {
    if (explicitOptions) {
      setOptions(explicitOptions);
    } else {
      throw new Error(
        "No MDX paths configured. Please provide options to loadAllMdx() or call init() first.",
      );
    }
  }

  if (explicitOptions) {
    setOptions(explicitOptions);
  }

  if (filterByPaths) {
    const invalidFilters = filterByPaths.filter(
      (path) => !paths.includes(path),
    );
    if (invalidFilters.length > 0) {
      throw new Error(`${invalidFilters.join(", ")} paths do not exist.`);
    }
  }

  const manifest = await generateMdxManifest();
  let files = manifest.files;

  if (filterByPaths && filterByPaths.length > 0) {
    const aliases =
      "alias" in options && options.alias
        ? [options.alias]
        : options.aliases || [];

    const pathsToInclude = paths
      .map((path, index) => aliases[index] || path)
      .filter((path) => filterByPaths.includes(path));

    files = files.filter((file) =>
      pathsToInclude.some((path) => file.urlPath.startsWith(`/${path}/`)),
    );
  }

  return files.map((file) => ({
    path: file.path,
    slug: file.slug,
    ...file.attributes,
  }));
}
