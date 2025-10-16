import type { Root } from "mdast";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import { remarkMarkAndUnravel } from "safe-mdx/parse";
import remarkGithubBlockquoteAlert from "./plugins/remark-github-blockquote-alert";

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
