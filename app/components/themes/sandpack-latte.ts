import type { SandpackTheme } from "./types";

export const latte: SandpackTheme = {
  colors: {
    surface1: "#f8f9fb",
    surface2: "#EBEDF0",
    surface3: "#e4e7eb",
    clickable: "#1e66f5",
    base: "#4c4f69",
    disabled: "#9ca0b0",
    hover: "#8839ef",
    accent: "#8839ef",
    error: "#d20f39",
    errorSurface: "#e6e9ef",
  },
  syntax: {
    plain: "#4c4f69",
    comment: {
      color: "#7c7f93",
      fontStyle: "italic",
    },
    keyword: "#8839ef",
    tag: "#1e66f5",
    punctuation: "#179299",
    definition: "#ea76cb",
    property: "#df8e1d",
    static: "#fe640b",
    string: "#40a02b",
  },
  font: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    mono: '"JetBrains Mono", "ui-monospace", "SFMono-Regular", "Roboto Mono", "Courier New", "monospace"',
    size: "14px",
    lineHeight: "1.7142857",
  },
};
