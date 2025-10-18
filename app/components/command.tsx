"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function Command({
  highlightedHtml,
}: {
  highlightedHtml: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = highlightedHtml;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative border border-b-4 p-4 pr-16 rounded-xs bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-700 mt-4 break-words [&_pre_code]:whitespace-pre-wrap">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2.5 right-2.5 p-2 rounded-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Copy to clipboard"
      >
        {copied ? (
          <Check size={16} className="text-green-500" />
        ) : (
          <Copy size={16} className="text-gray-500" />
        )}
      </button>
      <div
        // biome-ignore lint/security/noDangerouslySetInnerHtml: required by shiki
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </div>
  );
}
