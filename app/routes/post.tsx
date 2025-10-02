import { useLoaderData } from "react-router";
import { loadMdxFromAssets, type MdxData } from "~/lib/mdx";
import type { Route } from "./+types/post";

export async function loader({
  params,
  request,
  context,
}: Route.LoaderArgs): Promise<MdxData> {
  const { slug } = params;
  if (!slug) {
    throw new Response("Not Found", { status: 404 });
  }

  const mdxData = await loadMdxFromAssets(slug, context.assets, request);
  if (!mdxData) {
    throw new Response("Not Found", { status: 404 });
  }

  return mdxData;
}

export default function Post() {
  const { content, attributes } = useLoaderData<typeof loader>();

  return (
    <section>
      <h1>{attributes.title}</h1>
      <div>{content}</div>
    </section>
  );
}
