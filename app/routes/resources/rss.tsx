import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkMdx from "remark-mdx";
import remarkRehype from "remark-rehype";
import { getRuntimeMdxManifest } from "~/mdx/mdx-runtime";
import type { MdxFile } from "~/mdx/types";
import type { Route } from "./+types/rss";

// Type predicate to narrow MdxFile to files with valid dates
function hasDate(
  file: MdxFile,
): file is MdxFile & { attributes: { date: string } } {
  if (typeof file.attributes.date !== "string") return false;
  const date = new Date(file.attributes.date);
  return !Number.isNaN(date.getTime());
}

async function mdxToHtml(mdxContent: string): Promise<string> {
  const result = await remark()
    .use(remarkMdx)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(mdxContent);

  return String(result);
}

export async function loader({ request }: Route.LoaderArgs) {
  const { files } = await getRuntimeMdxManifest();

  // Filter out pages without dates and sort by published date (newest first)
  const sortedPosts = files.filter(hasDate).sort((a, b) => {
    const dateA = new Date(a.attributes.date);
    const dateB = new Date(b.attributes.date);
    return dateB.getTime() - dateA.getTime();
  });

  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  // Convert MDX to HTML for all posts
  const postsWithHtml = await Promise.all(
    sortedPosts.map(async (file) => ({
      file,
      html: await mdxToHtml(file.rawContent),
    })),
  );

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>code.charliegleason.com</title>
    <description>Code, resources, and thoughts on design and front-end development</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/resources/rss" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${postsWithHtml
      .map(({ file, html }) => {
        const postUrl = `${baseUrl}${file.url}`;
        const date = new Date(file.attributes.date);
        const pubDate = date.toUTCString();

        return `
    <item>
      <title>${escapeXml(file.attributes.title || "Untitled")}</title>
      <description>${escapeXml(file.attributes.description || "")}</description>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ""}
      ${file.attributes.author ? `<author>${escapeXml(file.attributes.author)}</author>` : ""}
      <content:encoded><![CDATA[${html}]]></content:encoded>
    </item>`;
      })
      .join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
