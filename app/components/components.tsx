import { HandMetal } from "lucide-react";
import type { MDXComponents } from "~/mdx/types";
import Picture from "../components/picture";
import Visual from "../components/visual";
import CodeBlock from "./live-code-block";

export const components: MDXComponents = {
  code: ({ children }: { children: React.ReactNode }) => {
    return (
      <code className="mx-0.5 rounded-xs bg-gray-200 dark:bg-gray-800 ring-2 ring-gray-200 dark:ring-gray-800">
        {children}
      </code>
    );
  },
  CodeBlock,
  Picture,
  Visual,
  HandMetal,
  YouTube: ({ videoId }: { videoId: string }) => {
    return (
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="rounded-lg shadow-lg"
      />
    );
  },
};
