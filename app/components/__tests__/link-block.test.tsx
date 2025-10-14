import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LinkBlock from "../link-block";

describe("LinkBlock", () => {
  it("should render with basic props", () => {
    render(<LinkBlock title="Test Title" href="/test-path" />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/test-path");
  });

  it("should render with description", () => {
    render(
      <LinkBlock
        title="Test Title"
        href="/test-path"
        description="This is a test description"
      />,
    );

    expect(screen.getByText("This is a test description")).toBeInTheDocument();
  });

  it("should render with caption", () => {
    render(
      <LinkBlock title="Test Title" href="/test-path" caption="5 days ago" />,
    );

    expect(screen.getByText("5 days ago")).toBeInTheDocument();
  });

  it("should default to View action", () => {
    render(<LinkBlock title="Test Title" href="/test-path" />);

    expect(screen.getByText("View")).toBeInTheDocument();
  });

  it("should open in same tab for View action", () => {
    render(<LinkBlock title="Test Title" href="/test-path" action="View" />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_self");
  });

  it("should open in new tab for Open action", () => {
    render(
      <LinkBlock
        title="Test Title"
        href="https://external.com"
        action="Open"
      />,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("should use custom action text", () => {
    render(
      <LinkBlock title="Test Title" href="/test-path" action="Download" />,
    );

    expect(screen.getByText("Download")).toBeInTheDocument();
  });

  it("should render all props together", () => {
    render(
      <LinkBlock
        title="Full Test"
        href="/full-test"
        description="Complete description"
        caption="Just now"
        action="Read"
      />,
    );

    expect(screen.getByText("Full Test")).toBeInTheDocument();
    expect(screen.getByText("Complete description")).toBeInTheDocument();
    expect(screen.getByText("Just now")).toBeInTheDocument();
    expect(screen.getByText("Read")).toBeInTheDocument();
  });

  it("should handle null caption", () => {
    render(<LinkBlock title="Test Title" href="/test-path" caption={null} />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });
});
