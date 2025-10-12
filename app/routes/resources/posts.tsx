import { loadAllMdxRuntime } from "~/mdx/mdx-runtime";

export async function loader() {
  const posts = await loadAllMdxRuntime();

  // Sort posts by published date (newest first)
  const sortedPosts = posts.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    const dateA = a.date;
    const dateB = b.date;
    return dateB.getTime() - dateA.getTime();
  });

  // Map to JSON-friendly format
  const postsData = sortedPosts.map((post) => ({
    slug: post.slug,
    urlPath: post.urlPath,
    title: post.title,
    description: post.description,
    date: post.date?.toISOString(),
    tags: post.tags,
  }));

  return Response.json(postsData);
}
