import bash from "@shikijs/langs/bash";
import javascript from "@shikijs/langs/javascript";
import json from "@shikijs/langs/json";
import jsx from "@shikijs/langs/jsx";
import tsx from "@shikijs/langs/tsx";
import typescript from "@shikijs/langs/typescript";
import vitesseDark from "@shikijs/themes/vitesse-dark";
import vitesseLight from "@shikijs/themes/vitesse-light";
import {
  createHighlighterCore,
  createOnigurumaEngine,
  type HighlighterCore,
  loadWasm,
} from "shiki";
// @ts-expect-error: wasm is untyped in Vite
import ONIG_WASM from "../vendor/onig.wasm";

let highlighterPromise: Promise<HighlighterCore> | null = null;

async function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      await loadWasm(ONIG_WASM);
      return await createHighlighterCore({
        themes: [vitesseLight, vitesseDark],
        langs: [bash, javascript, json, jsx, tsx, typescript],
        engine: createOnigurumaEngine(),
      });
    })();
  }
  return highlighterPromise;
}

export async function highlightCode(
  code: string,
  lang: string,
): Promise<string> {
  try {
    const highlighter = await getHighlighter();
    return highlighter.codeToHtml(code, {
      themes: {
        light: "vitesse-light",
        dark: "vitesse-dark",
      },
      lang: lang || "text",
      defaultColor: false,
    });
  } catch (e) {
    console.error("Error highlighting code", e);
    // Fallback to plain text if highlighting fails
    return `<pre><code>${code}</code></pre>`;
  }
}
