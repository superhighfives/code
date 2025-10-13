import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GeneralErrorBoundary from "../error-boundary";

describe("GeneralErrorBoundary", () => {
  it("should render route error response", () => {
    const error = {
      status: 404,
      statusText: "Not Found",
      data: null,
      internal: false,
    };

    render(<GeneralErrorBoundary error={error} />);

    expect(screen.getByText("404: Not Found")).toBeInTheDocument();
  });

  it("should render Error instance message", () => {
    const error = new Error("Something went wrong");

    render(<GeneralErrorBoundary error={error} />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("should render unknown error message", () => {
    const error = "string error";

    render(<GeneralErrorBoundary error={error} />);

    expect(screen.getByText("Unknown Error")).toBeInTheDocument();
  });

  it("should render heading and skull icon", () => {
    const error = new Error("Test error");

    const { container } = render(<GeneralErrorBoundary error={error} />);

    expect(screen.getByText(/cd ~\/code.charliegleason.com/)).toBeInTheDocument();

    // Check for skull icon (svg element)
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should handle null error", () => {
    render(<GeneralErrorBoundary error={null} />);

    expect(screen.getByText("Unknown Error")).toBeInTheDocument();
  });

  it("should handle undefined error", () => {
    render(<GeneralErrorBoundary error={undefined} />);

    expect(screen.getByText("Unknown Error")).toBeInTheDocument();
  });
});
