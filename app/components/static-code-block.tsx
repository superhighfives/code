import { useEffect, useState } from "react";
import { type BundledLanguage, codeToHtml } from "shiki";

export interface CodeProps {
  children?: string;
  lang: BundledLanguage;
}

export const Code = (props: CodeProps) => {
  const { children: code, lang } = props;

  const [highlightedCode, setHighlightedCode] = useState<string>();
  useEffect(() => {
    if (!code) {
      return;
    }

    codeToHtml(code, { lang, theme: "dracula" }).then(setHighlightedCode);
  }, [code, lang]);

  if (!code) {
    return null;
  }

  return (
    <pre className="bg-slate-800 text-slate-400 p-4 rounded overflow-x-auto">
      {highlightedCode ? (
        // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki
        <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      ) : (
        <code>{code}</code>
      )}
    </pre>
  );
};
