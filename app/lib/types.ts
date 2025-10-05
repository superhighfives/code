import type { runSync } from "@mdx-js/mdx";

export interface PostFrontmatter {
  title?: string;
  description?: string;
  author?: string;
  tags?: string[];
  image?: boolean | string;
  data?: MetaData;
  slug?: string;
  publishedAt?: string;
  date?: string;
  links?: MetaLinks;
}

export interface Post {
  slug: string;
  path: string;
  urlPath: string;
  title: string;
  description?: string;
  author?: string;
  publishedAt?: string;
  date?: Date;
  tags?: string[];
  frontmatter: PostFrontmatter;
}

export type LoadData = {
  __raw: string;
  attributes: PostFrontmatter;
};

export interface MdxComponentProps {
  components?: MDXComponents;
}

export interface MdxRuntimeData {
  content: unknown;
  frontmatter: PostFrontmatter;
}

export interface MdxLoaderData {
  __raw: string;
  attributes: PostFrontmatter;
}

export interface PostLoaderData {
  __raw: string;
  attributes: PostFrontmatter;
}

export type MDXContent = ReturnType<typeof runSync>["default"];
export type MDXProps = Parameters<MDXContent>[0];
export type MDXComponents = MDXProps["components"];
export type MdxAttributes = {
  path: string;
  slug: string;
  [key: string]: string;
};

export type MetaData = { key: string; value: string };
