import { HandMetal } from "lucide-react";
import type { MDXComponents } from "~/mdx/types";
import Command from "../command";
import InlineCode from "../inline-code";
import CodeBlock from "../live-code-block";
import Picture from "../picture";
import Visual from "../visual";

export const components: MDXComponents = {
  code: InlineCode,
  CodeBlock,
  Command,
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
