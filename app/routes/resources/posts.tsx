import { loadAllMdxRuntime } from "~/mdx/mdx-runtime";

export async function loader() {
  const posts = await loadAllMdxRuntime();

  // Sort posts by published date (newest first)
  const sortedPosts = posts.sort((a, b) => {
    const dateA = a.date || new Date(a.publishedAt || "1970-01-01");
    const dateB = b.date || new Date(b.publishedAt || "1970-01-01");
    return dateB.getTime() - dateA.getTime();
  });

  // Map to JSON-friendly format
  const postsData = sortedPosts.map((post) => ({
    slug: post.slug,
    urlPath: post.urlPath,
    title: post.title,
    description: post.description,
    publishedAt: post.publishedAt,
    date: post.date?.toISOString(),
    tags: post.tags,
  }));

  return Response.json(postsData);
}
