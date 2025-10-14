/**
 * Theme transformation utilities.
 * Pure functions that transform core ThemeDefinitions into library-specific formats.
 * These utilities contain no color values or theme knowledge - they only handle structure mapping.
 */

import type { ThemeDefinition } from "./definitions";
import type { SandpackTheme } from "./types";

/**
 * Transforms a ThemeDefinition into Sandpack's theme format
 */
export function toSandpack(theme: ThemeDefinition): SandpackTheme {
  return {
    colors: {
      surface1: theme.ui.surface1,
      surface2: theme.ui.surface2,
      surface3: theme.ui.surface3,
      clickable: theme.ui.clickable,
      base: theme.ui.base,
      disabled: theme.ui.disabled,
      hover: theme.ui.hover,
      accent: theme.ui.accent,
      error: theme.ui.error,
      errorSurface: theme.ui.errorSurface,
    },
    syntax: {
      plain: theme.syntax.plain,
      comment: {
        color: theme.syntax.comment,
        fontStyle: "italic",
      },
      keyword: theme.syntax.keyword,
      tag: theme.syntax.tag,
      punctuation: theme.syntax.punctuation,
      definition: theme.syntax.definition,
      property: theme.syntax.property,
      static: theme.syntax.static,
      string: theme.syntax.string,
    },
    font: {
      body: theme.font.body,
      mono: theme.font.mono,
      size: theme.font.size,
      lineHeight: theme.font.lineHeight,
    },
  };
}

interface ShikiTokenColor {
  scope: string | string[];
  settings: {
    foreground?: string;
    fontStyle?: string;
  };
}

interface ShikiTheme {
  name: string;
  type: "light" | "dark";
  colors: Record<string, string>;
  tokenColors: ShikiTokenColor[];
}

/**
 * Transforms a ThemeDefinition into Shiki's TextMate theme format
 */
export function toShiki(
  theme: ThemeDefinition,
  name: string,
  type: "light" | "dark",
): ShikiTheme {
  return {
    name,
    type,
    colors: {
      // Editor colors
      "editor.background": theme.ui.surface1,
      "editor.foreground": theme.syntax.plain,
      // UI colors
      "editorLineNumber.foreground": theme.ui.disabled,
      "editorLineNumber.activeForeground": theme.ui.base,
    },
    tokenColors: [
      {
        scope: ["comment", "punctuation.definition.comment"],
        settings: {
          foreground: theme.syntax.comment,
          fontStyle: "italic",
        },
      },
      {
        scope: [
          "keyword",
          "storage.type",
          "storage.modifier",
          "keyword.control",
        ],
        settings: {
          foreground: theme.syntax.keyword,
        },
      },
      {
        scope: ["entity.name.tag", "meta.tag.sgml", "markup.deleted.git_gutter"],
        settings: {
          foreground: theme.syntax.tag,
        },
      },
      {
        scope: ["punctuation", "meta.brace", "meta.delimiter"],
        settings: {
          foreground: theme.syntax.punctuation,
        },
      },
      {
        scope: [
          "entity.name.function",
          "meta.function-call",
          "support.function",
          "entity.name.type",
          "entity.name.class",
        ],
        settings: {
          foreground: theme.syntax.definition,
        },
      },
      {
        scope: [
          "variable.other.property",
          "support.type.property-name",
          "meta.object-literal.key",
        ],
        settings: {
          foreground: theme.syntax.property,
        },
      },
      {
        scope: ["constant", "support.constant", "variable.other.constant"],
        settings: {
          foreground: theme.syntax.static,
        },
      },
      {
        scope: ["string", "markup.inline.raw"],
        settings: {
          foreground: theme.syntax.string,
        },
      },
      {
        scope: ["variable", "support.variable"],
        settings: {
          foreground: theme.syntax.plain,
        },
      },
    ],
  };
}
