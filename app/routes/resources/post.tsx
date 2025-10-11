import { loadAllMdxRuntime } from "~/mdx/mdx-runtime";
import type { Route } from "./+types/post";

export async function loader({ params }: Route.LoaderArgs) {
  const { slug } = params;
  const posts = await loadAllMdxRuntime();

  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    throw new Response("Post not found", { status: 404 });
  }

  const postData = {
    slug: post.slug,
    urlPath: post.urlPath,
    title: post.title,
    description: post.description,
    publishedAt: post.publishedAt,
    date: post.date?.toISOString(),
    tags: post.tags,
    frontmatter: post.frontmatter,
  };

  return Response.json(postData);
}
