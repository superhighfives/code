import { Link } from "react-router";
import { mdxParse } from "safe-mdx/parse";
import { components } from "~/components/components";
import Metadata from "~/components/metadata";
import Metalinks from "~/components/metalinks";
import tags from "~/components/tags";
import { useMdxAttributes, useMdxComponent } from "~/mdx/mdx-hooks";
import type { PostLoaderData } from "~/mdx/types";
import { processArticleDate } from "~/utils/posts";
import { highlightCode } from "~/utils/shiki.server";
import { loadMdxRuntime } from "../mdx/mdx-runtime";
import type { Route } from "./+types/post";

export async function loader({
  request,
}: Route.LoaderArgs): Promise<PostLoaderData> {
  const { content, frontmatter } = await loadMdxRuntime(request);
  const rawContent = content as string;

  // Pre-process code blocks
  const ast = mdxParse(rawContent);
  const highlightedBlocks: Record<string, string> = {};

  // Find all code blocks and highlight them (skip live blocks)
  let blockIndex = 0;
  for (const node of ast.children) {
    if (node.type === "code" && node.value) {
      // Skip live code blocks
      if (node.meta?.includes("live")) {
        continue;
      }
      const key = `code-block-${blockIndex}`;
      highlightedBlocks[key] = await highlightCode(
        node.value,
        node.lang || "text"
      );
      blockIndex++;
    }
  }

  return {
    __raw: rawContent,
    attributes: frontmatter,
    highlightedBlocks,
  };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return tags();
  const { attributes } = data;
  return tags(attributes);
}

export default function Post() {
  const Component = useMdxComponent(components);
  const { title, data, links, date } = useMdxAttributes();
  const { metadata, isOldArticle } = processArticleDate(data, date);

  return (
    <div className="grid gap-y-4">
      <div className="flex flex-wrap gap-y-4 font-medium max-w-[65ch]">
        <Link
          to="/"
          className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 pr-4"
        >
          ❯ cd ~/code
          <span className="hidden sm:inline">.charliegleason.com</span>
        </Link>
        <span className="text-gray-300 dark:text-gray-700 max-sm:pr-4">/</span>
        <h1 className="text-gray-900 dark:text-gray-100 leading-relaxed sm:pl-4">
          {title}
        </h1>
      </div>
      <Metadata data={metadata} />
      {isOldArticle ? (
        <p className="rounded-md overflow-hidden border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 sm:px-4 py-3 max-w-[65ch]">
          This has not been updated in the last three months, so this
          information miiiiiight be out of date. Here be dragons, etc.
        </p>
      ) : null}
      <div className="prose [&>*:not(.code)]:max-w-[60ch] prose-headings:text-sm prose-sm dark:prose-invert prose-a:text-indigo-600 hover:prose-a:text-indigo-500 dark:prose-a:text-indigo-400 dark:hover:prose-a:text-indigo-300 prose-a:no-underline py-3 sm:px-4 border border-transparent max-w-none prose-h1:before:content-['#'] prose-h2:before:content-['##'] prose-h3:before:content-['###'] prose-h4:before:content-['####'] prose-h5:before:content-['#####'] prose-h6:before:content-['######'] prose-headings:before:mr-2 prose-headings:before:tracking-widest prose-headings:before:text-indigo-400 prose-h1:border-b-2 prose-h2:border-b prose-h1:border-indigo-500 prose-h2:border-indigo-500 prose-h2:pb-4 prose-h2:mb-4 prose-h1:mt-16 prose-h2:mt-12 prose-h3:mt-8 prose-h4:mt-4 prose-h5:mt-2 prose-h6:mt-2 prose-a:text-wrap prose-a:break-words prose-a:[word-break:break-word] text-pretty">
        <Component />
      </div>
      <Metalinks links={links} />
    </div>
  );
}
