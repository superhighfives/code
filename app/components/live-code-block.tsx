import {
  getSandpackCssText,
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { useEffect, useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { useTheme } from "~/routes/resources/theme-switch";
import LiveEditorBadge from "./live-editor-badge";
import { sandpackLatte, sandpackMocha } from "./themes";

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

function extractDependencies(code: string): {
  dependencies: Record<string, string>;
  cleanedCode: string;
} {
  // Match import statements with optional version comment
  // Example: import { MeshGradient } from '@paper-design/shaders-react' // ^0.0.55
  // This will capture the package name and version (if any), or fall back to latest
  const importRegex =
    /import\s+.*?\s+from\s+['"]([^'"]+)['"](?:\s*\/\/\s*(.+))?/g;
  const dependencies: Record<string, string> = {};
  let cleanedCode = code;
  let match = importRegex.exec(code);

  while (match !== null) {
    const packageName = match[1];
    const version = match[2]?.trim();
    // Only include external packages (not relative imports)
    if (!packageName.startsWith(".") && !packageName.startsWith("/")) {
      dependencies[packageName] = version || "latest";
      // Remove version comment from the code if it exists
      if (version) {
        cleanedCode = cleanedCode.replace(
          match[0],
          match[0].replace(/\s*\/\/\s*.+$/, ""),
        );
      }
    }
    match = importRegex.exec(code);
  }

  return { dependencies, cleanedCode };
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
      >
        <LiveEditorBadge />
      </SandpackPreview>
      <SandpackCodeEditor />
    </SandpackLayout>
  );
}

export default function LiveCodeBlock({ code }: PreProps) {
  const { dependencies, cleanedCode } = extractDependencies(code);
  const theme = useTheme();

  // Track the current code state across theme changes
  const [currentCode, setCurrentCode] = useState(cleanedCode);

  return (
    <SandpackProvider
      theme={theme === "dark" ? sandpackMocha : sandpackLatte}
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
          "sp-preview-frame": "custom-preview-frame",
          "sp-preview": "custom-preview",
        },
      }}
      template="react-ts"
      customSetup={{
        dependencies,
      }}
    >
      <ClientOnly>{() => <style>{getSandpackCssText()}</style>}</ClientOnly>
      <Sandpack onCodeChange={setCurrentCode} />
    </SandpackProvider>
  );
}
