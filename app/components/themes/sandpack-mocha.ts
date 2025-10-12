import type { SandpackTheme } from "./types";

export const mocha: SandpackTheme = {
  colors: {
    surface1: "#1e1e2e",
    surface2: "#313244",
    surface3: "#45475a",
    clickable: "#89b4fa",
    base: "#cdd6f4",
    disabled: "#6c7086",
    hover: "#cba6f7",
    accent: "#cba6f7",
    error: "#f38ba8",
    errorSurface: "#181825",
  },
  syntax: {
    plain: "#cdd6f4",
    comment: {
      color: "#9399b2",
      fontStyle: "italic",
    },
    keyword: "#cba6f7",
    tag: "#89b4fa",
    punctuation: "#94E2D5",
    definition: "#89B4FA",
    property: "#f9e2af",
    static: "#fab387",
    string: "#a6e3a1",
  },
  font: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    mono: '"Fira Mono", "DejaVu Sans Mono", Menlo, Consolas, "Liberation Mono", Monaco, "Lucida Console", monospace',
    size: "1em",
    lineHeight: "20px",
  },
};
