import { Link, useLoaderData } from "react-router";
import { loadAllMdxRuntime } from "../lib/mdx-runtime";
import type { Route } from "./+types/posts";

export async function loader({ request }: Route.LoaderArgs) {
  const posts = await loadAllMdxRuntime();

  // Sort posts by published date (newest first)
  const sortedPosts = posts.sort((a: any, b: any) => {
    const dateA = new Date(a.publishedAt || "1970-01-01");
    const dateB = new Date(b.publishedAt || "1970-01-01");
    return dateB.getTime() - dateA.getTime();
  });

  return { posts: sortedPosts };
}

export function meta() {
  return [
    { title: "All Posts" },
    { name: "description", content: "Browse all MDX posts" },
  ];
}

export default function Posts() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">All Posts</h1>

      <div className="space-y-6">
        {posts.map((post: any) => (
          <article
            key={post.slug}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">
              <Link
                to={`/posts/${post.slug}`}
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                {post.title}
              </Link>
            </h2>

            {post.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {post.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              {post.author && <span>By {post.author}</span>}
              {post.publishedAt && (
                <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
              )}
              {post.tags && Array.isArray(post.tags) && (
                <div className="flex gap-2">
                  {post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}

        {posts.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400 text-center">
            No posts found. Add some .mdx files to the posts/ directory.
          </p>
        )}
      </div>
    </div>
  );
}
