import type { Root } from "mdast";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkGithubBlockquoteAlert from "remark-github-blockquote-alert";
import remarkMdx from "remark-mdx";
import { remarkMarkAndUnravel } from "safe-mdx/parse";
import { visit } from "unist-util-visit";

/**
 * Plugin to wrap GitHub alerts in a div with "not-prose" class
 * and normalize className arrays to space-separated strings
 */
function remarkWrapAndNormalizeAlerts() {
  return (tree: Root) => {
    // biome-ignore lint/suspicious/noExplicitAny: allow any
    visit(tree, (node: any, index, parent) => {
      // Normalize className arrays to strings
      if (node.data?.hProperties?.className) {
        const className = node.data.hProperties.className;
        if (Array.isArray(className)) {
          node.data.hProperties.className = className.join(" ");
        }
      }

      // Wrap alert blockquotes in a div with "not-prose"
      if (
        node.data?.hProperties?.className?.includes("markdown-alert") &&
        parent &&
        typeof index === "number"
      ) {
        const wrapper = {
          type: "root",
          data: {
            hName: "div",
            hProperties: {
              className: "not-prose",
            },
          },
          children: [node],
        };
        parent.children[index] = wrapper;
      }
    });
  };
}

/**
 * Custom MDX parser that extends safe-mdx's default parser
 * with GitHub alerts support via remark-github-blockquote-alert.
 *
 * Maintains all default safe-mdx features:
 * - remarkMdx
 * - remarkFrontmatter (yaml, toml)
 * - remarkGfm
 * - remarkMarkAndUnravel (custom safe-mdx plugin)
 * + remarkGithubBlockquoteAlert (NEW)
 * + remarkWrapAndNormalizeAlerts (wraps alerts in not-prose div and fixes className arrays)
 */
const customMdxProcessor = remark()
  .use(remarkMdx)
  .use(remarkFrontmatter, ["yaml", "toml"])
  .use(remarkGfm)
  .use(remarkGithubBlockquoteAlert)
  .use(remarkWrapAndNormalizeAlerts)
  .use(remarkMarkAndUnravel)
  .use(() => {
    return (tree, file) => {
      file.data.ast = tree;
    };
  });

export function customMdxParse(code: string): Root {
  const file = customMdxProcessor.processSync(code);
  return file.data.ast as Root;
}
