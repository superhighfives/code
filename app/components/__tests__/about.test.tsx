import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { About } from "../about";

describe("About", () => {
  it("should render the greeting heading", () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /Hello, I'm Charlie/i }),
    ).toBeInTheDocument();
  });

  it("should render the description text", () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>,
    );

    expect(
      screen.getByText(
        /I'm a designer, developer, creative coder, and sometimes musician/i,
      ),
    ).toBeInTheDocument();
  });

  it("should render a link to the about page", () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>,
    );

    const link = screen.getByRole("link", { name: /More about me/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/about");
  });

  it("should display hand icon", () => {
    const { container } = render(
      <BrowserRouter>
        <About />
      </BrowserRouter>,
    );

    // Check for the Hand icon by looking for svg element
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
