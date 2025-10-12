import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { nightOwl } from "@codesandbox/sandpack-themes";

interface PreProps {
  live?: boolean;
  code: string;
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

export default function LiveCodeBlock({ code }: PreProps) {
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

  return (
    <SandpackProvider
      theme={nightOwl}
      files={{
        "/App.tsx": code,
        "/styles.css": { code: css, hidden: true },
      }}
      options={{
        externalResources: ["https://cdn.tailwindcss.com"],
        classes: {
          "sp-wrapper": "custom-wrapper",
          "sp-layout": "custom-layout",
          "sp-editor": "custom-editor",
          "sp-code-editor": "custom-code-editor",
        },
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
