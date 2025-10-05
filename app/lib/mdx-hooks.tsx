import { useLoaderData } from "react-router";
import { SafeMdxRenderer } from "safe-mdx";
import { mdxParse } from "safe-mdx/parse";
import type { LoadData, MDXComponents, MdxAttributes } from "./types";

export function useMdxComponent<T extends MDXComponents>(components?: T) {
  const { attributes, __raw } = useLoaderData<LoadData>();

  return () => {
    const ast = mdxParse(__raw);

    return (
      <SafeMdxRenderer
        markdown={__raw}
        components={components}
        {...attributes}
        mdast={ast}
      />
    );
  };
}

export const useMdxFiles = () => {
  return useLoaderData<MdxAttributes[]>();
};

export const useMdxAttributes = () => {
  const { attributes } = useLoaderData<LoadData>();

  return attributes;
};
