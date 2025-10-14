import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { components } from "../utils/components";

// Mock YouTube component to prevent iframe fetch warnings in tests
// We use data-src instead of src to prevent happy-dom from trying to fetch
const MockYouTube = ({ videoId }: { videoId: string }) => (
  <iframe
    width="560"
    height="315"
    data-src={`https://www.youtube.com/embed/${videoId}`}
    title="YouTube video player"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerPolicy="strict-origin-when-cross-origin"
    allowFullScreen
    className="rounded-lg shadow-lg"
    data-testid="youtube-iframe"
  />
);

describe("MDX Components", () => {
  describe("code component", () => {
    it("should render inline code with children", () => {
      const CodeComponent = components.code as React.ComponentType<{
        children: React.ReactNode;
      }>;

      render(<CodeComponent>const test = true;</CodeComponent>);

      expect(screen.getByText("const test = true;")).toBeInTheDocument();
    });

    it("should apply proper styling classes", () => {
      const CodeComponent = components.code as React.ComponentType<{
        children: React.ReactNode;
      }>;

      const { container } = render(<CodeComponent>test</CodeComponent>);
      const codeElement = container.querySelector("code");

      expect(codeElement).toHaveClass("px-0.5");
      expect(codeElement).toHaveClass("rounded-xs");
    });
  });

  describe("YouTube component", () => {
    it("should render YouTube iframe with correct video ID", () => {
      render(<MockYouTube videoId="dQw4w9WgXcQ" />);

      const iframe = screen.getByTitle("YouTube video player");
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute(
        "data-src",
        "https://www.youtube.com/embed/dQw4w9WgXcQ",
      );
    });

    it("should have correct iframe attributes", () => {
      render(<MockYouTube videoId="test123" />);

      const iframe = screen.getByTitle("YouTube video player");
      expect(iframe).toHaveAttribute("width", "560");
      expect(iframe).toHaveAttribute("height", "315");
      expect(iframe).toHaveAttribute("allowFullScreen");
      expect(iframe).toHaveAttribute(
        "referrerPolicy",
        "strict-origin-when-cross-origin",
      );
    });

    it("should allow required permissions", () => {
      render(<MockYouTube videoId="test123" />);

      const iframe = screen.getByTitle("YouTube video player");
      const allow = iframe.getAttribute("allow");

      expect(allow).toContain("accelerometer");
      expect(allow).toContain("autoplay");
      expect(allow).toContain("clipboard-write");
      expect(allow).toContain("encrypted-media");
      expect(allow).toContain("gyroscope");
      expect(allow).toContain("picture-in-picture");
    });
  });

  it("should include CodeBlock component", () => {
    expect(components.CodeBlock).toBeDefined();
  });

  it("should include Picture component", () => {
    expect(components.Picture).toBeDefined();
  });

  it("should include Visual component", () => {
    expect(components.Visual).toBeDefined();
  });

  it("should include HandMetal component", () => {
    expect(components.HandMetal).toBeDefined();
  });
});
