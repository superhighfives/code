import { formatDistanceToNow } from "date-fns";
import type { MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { About } from "~/components/about";
import LinkBlock from "~/components/link-block";
import tags from "~/components/utils/tags";
import { loadAllMdxRuntime } from "~/mdx/mdx-runtime";
import type { Post } from "~/mdx/types";

export const meta: MetaFunction = () => tags();

export async function loader() {
  const posts = await loadAllMdxRuntime();

  // Sort posts by published date (newest first)
  const sortedPosts = posts
    .filter((post) => post.date)
    .sort((a: Post, b: Post) => {
      if (!a.date || !b.date) return 0;
      return b.date.getTime() - a.date.getTime();
    });

  return { posts: sortedPosts };
}

export default function Index() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <div className="grid sm:grid-cols-2 gap-8 max-w-[65ch] content-end h-full">
      <h1 className="text-gray-400 dark:text-gray-500 col-span-full">
        ❯ cd ~/code.charliegleason.com
      </h1>
      <About />
      <div className="text-gray-900 dark:text-gray-100 sm:col-span-2 bg-white dark:bg-gray-950 grid gap-4">
        <div className="rounded-md overflow-hidden shadow-sm divide-y divide-gray-100 dark:divide-gray-900 border border-gray-200 dark:border-gray-800">
          {posts.length ? (
            posts.map((post) => {
              const dateCaption = post.date
                ? `${formatDistanceToNow(post.date)} ago`
                : null;
              return (
                <LinkBlock
                  key={post.slug}
                  title={post.title}
                  description={post.description}
                  caption={dateCaption}
                  href={post.url}
                />
              );
            })
          ) : (
            <p className="flex items-center p-4 leading-6 text-gray-400">
              No posts found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
