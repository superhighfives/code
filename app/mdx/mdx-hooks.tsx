import { useLoaderData } from "react-router";
import { SafeMdxRenderer } from "safe-mdx";
import { mdxParse } from "safe-mdx/parse";
import type { MDXComponents, MdxAttributes, PostLoaderData } from "./types";

export function useMdxComponent(components?: MDXComponents) {
  const { attributes, __raw } = useLoaderData<PostLoaderData>();

  return () => {
    const ast = mdxParse(__raw);

    return (
      <SafeMdxRenderer
        markdown={__raw}
        components={components}
        mdast={ast}
        allowClientEsmImports={true}
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
