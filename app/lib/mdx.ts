import { compile } from "@mdx-js/mdx";

export interface MdxData {
  content: string;
  attributes: Record<string, string>;
}

export async function loadMdxFromAssets(
  slug: string,
  assets: Fetcher,
  request: Request,
): Promise<MdxData | null> {
  try {
    const url = new URL(`/posts/${slug}.mdx`, request.url);
    const response = await assets.fetch(url.href);
    if (!response.ok) return null;

    const mdxContent = await response.text();

    // Extract frontmatter
    const frontmatterMatch = mdxContent.match(/^---\n(.*?)\n---\n(.*)/s);
    if (!frontmatterMatch) {
      return { content: mdxContent, attributes: {} };
    }

    const [, frontmatter, content] = frontmatterMatch;
    const attributes: Record<string, string> = {};

    // Parse simple YAML frontmatter
    frontmatter.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split(":");
      if (key && valueParts.length) {
        attributes[key.trim()] = valueParts.join(":").trim();
      }
    });

    return { content, attributes };
  } catch (error) {
    console.error("Error loading MDX:", error);
    return null;
  }
}

export function compileMdx(content: string) {
  return compile(content, {
    outputFormat: "function-body",
    development: false,
  });
}
