import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import NotFoundRoute, { loader } from "../404";

describe("404 Route", () => {
  describe("Component", () => {
    it("should render 404 error message", async () => {
      const RemixStub = createRoutesStub([
        {
          path: "/404",
          Component: NotFoundRoute,
          HydrateFallback: () => <div>Loading...</div>,
          loader,
        },
      ]);

      render(<RemixStub initialEntries={["/404"]} />);

      await screen.findByText("404: Not Found");
      expect(screen.getByText("404: Not Found")).toBeInTheDocument();
    });

    it("should render error boundary component", async () => {
      const RemixStub = createRoutesStub([
        {
          path: "/404",
          Component: NotFoundRoute,
          HydrateFallback: () => <div>Loading...</div>,
          loader,
        },
      ]);

      const { container } = render(<RemixStub initialEntries={["/404"]} />);

      await screen.findByText("404: Not Found");

      // Check for the skull icon (svg element from error boundary)
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should render the header", async () => {
      const RemixStub = createRoutesStub([
        {
          path: "/404",
          Component: NotFoundRoute,
          HydrateFallback: () => <div>Loading...</div>,
          loader,
        },
      ]);

      render(<RemixStub initialEntries={["/404"]} />);

      await screen.findByText(/cd ~\/code.charliegleason.com/);
      expect(screen.getByText(/cd ~\/code.charliegleason.com/)).toBeInTheDocument();
    });
  });
});
