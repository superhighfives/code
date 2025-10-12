import { useLoaderData } from "react-router";
import { SafeMdxRenderer } from "safe-mdx";
import { mdxParse } from "safe-mdx/parse";
import LiveCodeBlock from "~/components/live-code-block";
import { Code } from "~/components/static-code-block";
import type { MDXComponents, MdxAttributes, PostLoaderData } from "./types";

function parseMetaString(
  meta?: string | null,
): Record<string, boolean | string> {
  if (!meta) return {};

  const result: Record<string, boolean | string> = {};

  // Match key="value" or key
  const regex = /(\w+)(?:="([^"]*)")?/g;
  let match = regex.exec(meta);

  while (match !== null) {
    const [, key, value] = match;
    result[key] = value !== undefined ? value : true;
    match = regex.exec(meta);
  }

  return result;
}

export function useMdxComponent(components?: MDXComponents) {
  const { attributes, __raw, highlightedBlocks } = useLoaderData<PostLoaderData>();

  return () => {
    const ast = mdxParse(__raw);
    let blockIndex = 0;

    return (
      <SafeMdxRenderer
        markdown={__raw}
        components={components}
        mdast={ast}
        allowClientEsmImports={true}
        renderNode={(node) => {
          if (node.type === "code") {
            const meta = parseMetaString(node.meta);
            if (meta.live) {
              return (
                <div className="not-prose code">
                  <LiveCodeBlock live code={node.value} />
                </div>
              );
            } else {
              const key = `code-block-${blockIndex}`;
              const highlightedHtml = highlightedBlocks?.[key] || `<pre><code>${node.value}</code></pre>`;
              blockIndex++;
              return (
                <div className="not-prose code">
                  <Code highlightedHtml={highlightedHtml} />
                </div>
              );
            }
          }
        }}
        {...attributes}
      />
    );
  };
}

export const useMdxFiles = () => {
  return useLoaderData<MdxAttributes[]>();
};

export const useMdxAttributes = () => {
  const { attributes } = useLoaderData<PostLoaderData>();

  return attributes;
};
