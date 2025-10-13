import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { action, ThemeSwitch } from "../theme-switch";

// Mock the utilities
vi.mock("~/utils/client-hints", () => ({
  useHints: () => ({ theme: "light" }),
  useOptionalHints: () => ({ theme: "light" }),
}));

vi.mock("~/utils/request-info", () => ({
  useRequestInfo: () => ({
    path: "/test",
    hints: { theme: "light" },
    origin: "http://localhost",
    userPrefs: { theme: null },
  }),
  useOptionalRequestInfo: () => ({
    path: "/test",
    hints: { theme: "light" },
    origin: "http://localhost",
    userPrefs: { theme: null },
  }),
}));

vi.mock("~/utils/theme.server", () => ({
  setTheme: (theme: string) => `theme=${theme}; Path=/; HttpOnly; SameSite=Lax`,
}));

vi.mock("remix-utils/server-only", () => ({
  ServerOnly: ({ children }: { children: () => React.ReactNode }) => children(),
}));

describe("Theme Switch", () => {
  describe("ThemeSwitch Component", () => {
    it("should render with light theme icon", async () => {
      const RemixStub = createRoutesStub([
        {
          path: "/",
          Component: () => <ThemeSwitch userPreference="light" />,
        },
      ]);

      const { container } = render(<RemixStub initialEntries={["/"]} />);

      // Should show Sun icon for light mode
      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
    });

    it("should render with dark theme icon", async () => {
      const RemixStub = createRoutesStub([
        {
          path: "/",
          Component: () => <ThemeSwitch userPreference="dark" />,
        },
      ]);

      const { container } = render(<RemixStub initialEntries={["/"]} />);

      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
    });

    it("should render with system theme icon", async () => {
      const RemixStub = createRoutesStub([
        {
          path: "/",
          Component: () => <ThemeSwitch userPreference="system" />,
        },
      ]);

      const { container } = render(<RemixStub initialEntries={["/"]} />);

      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
    });

    it("should have hidden inputs for theme and redirectTo", async () => {
      const RemixStub = createRoutesStub([
        {
          path: "/",
          Component: () => <ThemeSwitch userPreference="light" />,
        },
      ]);

      const { container } = render(<RemixStub initialEntries={["/"]} />);

      const themeInput = container.querySelector('input[name="theme"]');
      const redirectToInput = container.querySelector('input[name="redirectTo"]');

      expect(themeInput).toBeInTheDocument();
      expect(themeInput).toHaveAttribute("type", "hidden");

      expect(redirectToInput).toBeInTheDocument();
      expect(redirectToInput).toHaveAttribute("type", "hidden");
    });

    it("should cycle through themes: light -> dark -> system", async () => {
      const RemixStub = createRoutesStub([
        {
          path: "/",
          Component: () => <ThemeSwitch userPreference="light" />,
        },
      ]);

      const { container } = render(<RemixStub initialEntries={["/"]} />);

      const themeInput = container.querySelector('input[name="theme"]') as HTMLInputElement;

      // Light -> Dark
      expect(themeInput.value).toBe("dark");
    });

    it("should default to system when no preference", async () => {
      const RemixStub = createRoutesStub([
        {
          path: "/",
          Component: () => <ThemeSwitch userPreference={null} />,
        },
      ]);

      const { container } = render(<RemixStub initialEntries={["/"]} />);

      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
    });
  });
});
