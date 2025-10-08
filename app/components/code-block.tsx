import {
  Sandpack,
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { nightOwl } from "@codesandbox/sandpack-themes";
import type { ReactNode } from "react";

interface PreProps {
  children?: ReactNode;
  live?: boolean;
  code: string;
  [key: string]: ReactNode | string | Array<ReactNode | string>;
}

const css = `body {
font-family: sans-serif;
-webkit-font-smoothing: auto;
-moz-font-smoothing: auto;
-moz-osx-font-smoothing: grayscale;
font-smoothing: auto;
text-rendering: optimizeLegibility;
font-smooth: always;
-webkit-tap-highlight-color: transparent;
-webkit-touch-callout: none;
background-color: #000;
}

html,
body,
#root {
height: 100%;
}

h1 {
font-size: 1.5rem;
}`;

export default function CodeBlock({
  children,
  live,
  code,
  ...props
}: PreProps) {
  if (!live) {
    // Filter out non-DOM props before passing to pre element
    const { dataLanguage, style, dataTheme, ...domProps } = props;
    void dataLanguage;
    void dataTheme;
    void style;
    return <pre {...domProps}>{children}</pre>;
  }

  const extractDependencies = (code: string): Record<string, string> => {
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    const dependencies: Record<string, string> = {};
    let match = importRegex.exec(code);

    while (match !== null) {
      const packageName = match[1];
      // Only include external packages (not relative imports)
      if (!packageName.startsWith(".") && !packageName.startsWith("/")) {
        dependencies[packageName] = "latest";
      }
      match = importRegex.exec(code);
    }

    return dependencies;
  };

  const dependencies = extractDependencies(code);

  console.log(code, dependencies);

  return (
    <SandpackProvider
      theme={nightOwl}
      files={{
        "/App.tsx": code,
        "/styles.css": { code: css, hidden: true },
      }}
      options={{
        externalResources: ["https://cdn.tailwindcss.com"],
      }}
      template="react-ts"
      customSetup={{
        dependencies,
      }}
    >
      <SandpackLayout>
        <SandpackCodeEditor />
        <SandpackPreview
          showOpenInCodeSandbox={false}
          showRefreshButton={false}
          showOpenNewtab={false}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
}
