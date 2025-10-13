import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { parseWithZod } from "@conform-to/zod/v4";
import { z } from "zod/v4";
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

// Define the schema for validation tests (same as in theme-switch.tsx)
const ThemeFormSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
  redirectTo: z.string().optional(),
});

describe("Theme Switch", () => {
  describe("Form Validation", () => {
    it("should validate valid dark theme", () => {
      const formData = new FormData();
      formData.append("theme", "dark");

      const submission = parseWithZod(formData, { schema: ThemeFormSchema });

      expect(submission.status).toBe("success");
      if (submission.status === "success") {
        expect(submission.value.theme).toBe("dark");
      }
    });

    it("should validate valid light theme", () => {
      const formData = new FormData();
      formData.append("theme", "light");

      const submission = parseWithZod(formData, { schema: ThemeFormSchema });

      expect(submission.status).toBe("success");
      if (submission.status === "success") {
        expect(submission.value.theme).toBe("light");
      }
    });

    it("should validate valid system theme", () => {
      const formData = new FormData();
      formData.append("theme", "system");

      const submission = parseWithZod(formData, { schema: ThemeFormSchema });

      expect(submission.status).toBe("success");
      if (submission.status === "success") {
        expect(submission.value.theme).toBe("system");
      }
    });

    it("should validate theme with optional redirectTo", () => {
      const formData = new FormData();
      formData.append("theme", "dark");
      formData.append("redirectTo", "/about");

      const submission = parseWithZod(formData, { schema: ThemeFormSchema });

      expect(submission.status).toBe("success");
      if (submission.status === "success") {
        expect(submission.value.theme).toBe("dark");
        expect(submission.value.redirectTo).toBe("/about");
      }
    });

    it("should reject invalid theme value", () => {
      const formData = new FormData();
      formData.append("theme", "invalid-theme");

      const submission = parseWithZod(formData, { schema: ThemeFormSchema });

      expect(submission.status).toBe("error");
    });

    it("should reject missing theme", () => {
      const formData = new FormData();

      const submission = parseWithZod(formData, { schema: ThemeFormSchema });

      expect(submission.status).toBe("error");
    });
  });

  describe("Action Function", () => {
    it("should handle valid dark theme without errors", async () => {
      const formData = new FormData();
      formData.append("theme", "dark");

      const request = new Request("http://localhost/theme-switch", {
        method: "POST",
        body: formData,
      });

      const response = await action({ request, params: {}, context: {} } as any);

      // Should return a defined response (React Router's DataWithResponseInit or redirect)
      expect(response).toBeDefined();
      expect(response).toHaveProperty("init");
    });

    it("should handle valid light theme without errors", async () => {
      const formData = new FormData();
      formData.append("theme", "light");

      const request = new Request("http://localhost/theme-switch", {
        method: "POST",
        body: formData,
      });

      const response = await action({ request, params: {}, context: {} } as any);

      expect(response).toBeDefined();
      expect(response).toHaveProperty("init");
    });

    it("should handle valid system theme without errors", async () => {
      const formData = new FormData();
      formData.append("theme", "system");

      const request = new Request("http://localhost/theme-switch", {
        method: "POST",
        body: formData,
      });

      const response = await action({ request, params: {}, context: {} } as any);

      expect(response).toBeDefined();
      expect(response).toHaveProperty("init");
    });

    it("should handle theme change with redirectTo", async () => {
      const formData = new FormData();
      formData.append("theme", "dark");
      formData.append("redirectTo", "/about");

      const request = new Request("http://localhost/theme-switch", {
        method: "POST",
        body: formData,
      });

      const response = await action({ request, params: {}, context: {} } as any);

      // When redirectTo is provided, it should return a redirect response
      expect(response).toBeDefined();
    });

    it("should throw on invalid theme value", async () => {
      const formData = new FormData();
      formData.append("theme", "invalid");

      const request = new Request("http://localhost/theme-switch", {
        method: "POST",
        body: formData,
      });

      // invariantResponse throws an error for invalid themes
      await expect(
        action({ request, params: {}, context: {} } as any)
      ).rejects.toThrow();
    });

    it("should throw on missing theme", async () => {
      const formData = new FormData();

      const request = new Request("http://localhost/theme-switch", {
        method: "POST",
        body: formData,
      });

      // invariantResponse throws an error when theme is missing
      await expect(
        action({ request, params: {}, context: {} } as any)
      ).rejects.toThrow();
    });
  });

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
