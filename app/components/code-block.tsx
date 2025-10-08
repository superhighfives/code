import { Sandpack } from "@codesandbox/sandpack-react";
import { nightOwl } from "@codesandbox/sandpack-themes";
import type { ReactNode } from "react";

interface PreProps {
  children?: ReactNode;
  live?: boolean;
  code: string;
  [key: string]: ReactNode | string | Array<ReactNode | string>;
}

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
    <Sandpack
      theme={nightOwl}
      files={{
        "/App.tsx": code,
        "/index.css": `body { background-color: #000; }`,
      }}
      options={{
        externalResources: ["https://cdn.tailwindcss.com"],
      }}
      template="react-ts"
      customSetup={{
        dependencies,
      }}
    />
  );
}
