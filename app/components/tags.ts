import type { PostFrontmatter } from "~/mdx/types";

function generateImage(slug: string) {
  return `${import.meta.env.PROD ? "https://code.charliegleason.com" : "http://localhost:8080"}/resources/og-image/${slug}`;
}

export default function tags(attributes?: PostFrontmatter) {
  const { title, description, slug, image } = attributes || {};
  const metaTitle = `${title ? `${title} ` : ""}❯ ~/code.charliegleason.com`;
  const metaDescription = description
    ? `${description}`
    : "Tutorials, code snippets, and resources for design and front end development";
  const metaImage = image ? slug && generateImage(slug) : "/social-default.png";

  return [
    { title: metaTitle },
    {
      name: "title",
      content: metaTitle,
    },
    {
      name: "description",
      content: metaDescription,
    },
    {
      property: "og:title",
      content: title,
    },
    {
      property: "og:description",
      content: metaDescription,
    },
    {
      property: "og:image",
      content: metaImage,
    },
    {
      property: "og:type",
      content: "website",
    },
  ];
}
