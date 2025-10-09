import { useEffect, useState } from "react";
import type { BundledLanguage } from "shiki";

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

    // https://shiki.style/guide/install#fine-grained-bundle
    import("shiki").then(
      async ({ getSingletonHighlighterCore, createOnigurumaEngine }) => {
        const highlighter = await getSingletonHighlighterCore({
          themes: [import("shiki/themes/dracula.mjs")],
          langs: [
            import("shiki/langs/javascript.mjs"),
            import("shiki/langs/typescript.mjs"),
            import("shiki/langs/json.mjs"),
            import("shiki/langs/shell.mjs"),
            import("shiki/langs/console.mjs"),
          ],
          engine: createOnigurumaEngine(() => import("shiki/wasm")),
        });

        setHighlightedCode(
          highlighter.codeToHtml(code, { lang, theme: "dracula" }),
        );
      },
    );
  }, [code, lang]);

  if (!code) {
    return null;
  }

  return (
    <>
      {highlightedCode ? (
        // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki
        <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      ) : (
        <code>{code}</code>
      )}
    </>
  );
};
