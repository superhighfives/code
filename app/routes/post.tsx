import { Link } from "react-router";
import { components } from "~/components/components";
import Metadata from "~/components/metadata";
import Metalinks from "~/components/metalinks";
import tags from "~/components/tags";
import { useMdxAttributes, useMdxComponent } from "~/lib/mdx-hooks";
import type { PostLoaderData } from "~/lib/types";
import { getMetaData, processArticleDate } from "~/utils/posts";
import { loadMdxRuntime } from "../lib/mdx-runtime";
import type { Route } from "./+types/post";

export async function loader({
  request,
}: Route.LoaderArgs): Promise<PostLoaderData> {
  const { content, frontmatter } = await loadMdxRuntime(request);
  return {
    __raw: content as string,
    attributes: frontmatter,
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

  const metadata = getMetaData(data);
  const metalinks = getMetaData(links);

  const { updatedMetadata, isOldArticle } = processArticleDate(metadata, date);

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
      <Metadata data={updatedMetadata} />
      {isOldArticle ? (
        <p className="rounded-md overflow-hidden border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 sm:px-4 py-3 max-w-[65ch]">
          This has not been updated in the last three months, so this
          information miiiiiight be out of date. Here be dragons, etc.
        </p>
      ) : null}
      <div className="prose prose-headings:text-sm prose-sm dark:prose-invert prose-a:text-indigo-600 hover:prose-a:text-indigo-500 dark:prose-a:text-indigo-400 dark:hover:prose-a:text-indigo-300 prose-a:no-underline py-3 sm:px-4 border border-transparent max-w-none [&>*:not(.code)]:max-w-[60ch] [&>.code]:overflow-x-scroll [&>.code]:max-w-[calc(100vw)] [&>.code]:-mx-8 sm:[&>.code]:-mx-12 [&>.code_code>*]:px-8 sm:[&>.code_code>*]:px-12 [&>.code]:border-y [&>.code]:py-4 [&>.code]:dark:border-gray-800 [&>.code]:dark:bg-black [&>.code]:bg-gray-50 [&>.code]:text-gray-400 prose-h1:before:content-['#'] prose-h2:before:content-['##'] prose-h3:before:content-['###'] prose-h4:before:content-['####'] prose-h5:before:content-['#####'] prose-h6:before:content-['######'] prose-headings:before:mr-2 prose-headings:before:tracking-widest prose-headings:before:text-indigo-400 prose-h1:border-b-2 prose-h2:border-b prose-h1:border-indigo-500 prose-h2:border-indigo-500 prose-h2:pb-4 prose-h2:mb-4 prose-h1:mt-16 prose-h2:mt-12 prose-h3:mt-8 prose-h4:mt-4 prose-h5:mt-2 prose-h6:mt-2 prose-a:text-wrap prose-a:break-words prose-a:[word-break:break-word] text-pretty">
        <Component />
      </div>
      <Metalinks links={metalinks} />
    </div>
  );
}
