import { Suspense, useEffect, useState } from "react";
import { Await } from "react-router";
import { type BundledLanguage, codeToHtml } from "shiki";

export interface CodeProps {
  children?: string;
  lang: BundledLanguage;
}

// export const Code = (props: CodeProps) => {
//   const { children: code, lang } = props;

//   if (!code) {
//     return null;
//   }

//   const highlightedCode = codeToHtml(code, {
//     lang,
//     themes: {
//       light: "min-light",
//       dark: "nord",
//     },
//     defaultColor: false,
//   });

//   return (
//     <Suspense
//       fallback={
//         <div className="text-gray-400 overflow-x-auto">
//           <pre>
//             <code>{code}</code>
//           </pre>
//         </div>
//       }
//     >
//       <Await resolve={highlightedCode}>
//         {(highlightedCode) => (
//           // biome-ignore lint/security/noDangerouslySetInnerHtml: required by shiki
//           <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
//         )}
//       </Await>
//     </Suspense>
//   );
// };

export const Code = (props: CodeProps) => {
  const { children: code, lang } = props;

  const [highlightedCode, setHighlightedCode] = useState<string>();
  useEffect(() => {
    if (!code) {
      return;
    }

    codeToHtml(code, {
      lang,
      themes: {
        light: "min-light",
        dark: "nord",
      },
      defaultColor: false,
    }).then(setHighlightedCode);
  }, [code, lang]);

  if (!code) {
    return null;
  }

  return highlightedCode ? (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: required by shiki
    <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
  ) : (
    <div className="text-gray-400 overflow-x-auto">
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
};
