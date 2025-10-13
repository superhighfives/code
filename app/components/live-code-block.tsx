import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { useEffect, useState } from "react";
import { useTheme } from "~/routes/resources/theme-switch";
import { latte } from "./themes/sandpack-latte";
import { mocha } from "./themes/sandpack-mocha";

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

function extractDependencies(code: string): Record<string, string> {
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
}

function Sandpack({ onCodeChange }: { onCodeChange: (code: string) => void }) {
  const { sandpack } = useSandpack();

  useEffect(() => {
    const currentCode = sandpack.files["/App.tsx"];
    const code =
      typeof currentCode === "string" ? currentCode : currentCode?.code;
    if (code) {
      onCodeChange(code);
    }
  }, [sandpack.files, onCodeChange]);

  return (
    <SandpackLayout>
      <SandpackPreview
        showOpenInCodeSandbox={false}
        showRefreshButton={false}
        showOpenNewtab={false}
      />
      <SandpackCodeEditor />
    </SandpackLayout>
  );
}

export default function LiveCodeBlock({ code }: PreProps) {
  const dependencies = extractDependencies(code);
  const theme = useTheme();

  // Track the current code state across theme changes
  const [currentCode, setCurrentCode] = useState(code);

  return (
    <SandpackProvider
      theme={theme === "dark" ? mocha : latte}
      files={{
        "/App.tsx": currentCode,
        "/styles.css": { code: css, hidden: true },
      }}
      options={{
        externalResources: ["https://cdn.tailwindcss.com"],
        classes: {
          "sp-wrapper": "custom-wrapper",
          "sp-layout": "custom-layout",
          "sp-editor": "custom-editor",
          "sp-code-editor": "custom-code-editor",
          "sp-pre-placeholder": "custom-pre-placeholder",
          "sp-preview": "custom-preview",
          "sp-cm": "custom-cm",
        },
      }}
      template="react-ts"
      customSetup={{
        dependencies,
      }}
    >
      <Sandpack onCodeChange={setCurrentCode} />
    </SandpackProvider>
  );
}
