import { HandMetal } from "lucide-react";
import type { MDXComponents } from "~/mdx/types";
import Picture from "../components/picture";
import Visual from "../components/visual";
import CodeBlock from "./live-code-block";

export const components: MDXComponents = {
  code: ({ children }: { children: React.ReactNode }) => {
    return <code className="text-4xl bg-gray-800">{children}</code>;
  },
  CodeBlock,
  Picture,
  Visual,
  HandMetal,
  YouTube: ({ id }: { id: string }) => {
    return (
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="rounded-lg shadow-lg"
      />
    );
  },
};
