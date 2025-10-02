import { useLoaderData } from "react-router";
import { loadMdxRuntime } from "../lib/mdx-runtime.js";
import type { Route } from "./+types/post";

export async function loader({ request }: Route.LoaderArgs) {
  return loadMdxRuntime(request);
}

export function meta({ data }: Route.MetaArgs) {
  const { attributes } = data || { attributes: {} };
  return [
    { title: (attributes as any).title || "Post" },
    { name: "description", content: (attributes as any).description || "" },
    { property: "og:title", content: (attributes as any).title || "Post" },
    {
      property: "og:description",
      content: (attributes as any).description || "",
    },
  ];
}

const components = {
  YouTube: ({ id }: { id: string }) => {
    return (
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="rounded-lg shadow-lg"
      />
    );
  },
};

export default function Post() {
  const { content, attributes } = useLoaderData<typeof loader>();

  return (
    <article className="prose prose-gray dark:prose-invert max-w-4xl mx-auto p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{attributes.title}</h1>
        {attributes.description && (
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            {attributes.description}
          </p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
          {attributes.author && <span>By {attributes.author}</span>}
          {attributes.publishedAt && (
            <span>{new Date(attributes.publishedAt).toLocaleDateString()}</span>
          )}
          {attributes.tags && Array.isArray(attributes.tags) && (
            <div className="flex gap-2">
              {attributes.tags.map((tag: string) => (
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
      </header>
      <div className="mdx-content">{content}</div>
    </article>
  );
}
