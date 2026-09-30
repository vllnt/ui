import { createRef, type ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  EraColumn,
  EraComparison,
  EraDomain,
  EraFigure,
  EraHighlight,
} from "./era-comparison";

function renderEra(children: ReactNode) {
  return render(
    <EraComparison>
      <EraColumn name="Era">
        <EraDomain name="Art">{children}</EraDomain>
      </EraColumn>
    </EraComparison>,
  );
}

describe("EraComparison", () => {
  it("renders all era columns with headers, periods, region, and data attributes", () => {
    const { container } = render(
      <EraComparison>
        <EraColumn
          color="amber"
          name="Renaissance"
          period="1400–1600"
          region="Mediterranean"
        >
          <EraDomain name="Art">
            <EraHighlight>Perspective painting</EraHighlight>
            <EraFigure name="Leonardo da Vinci" />
          </EraDomain>
        </EraColumn>
        <EraColumn color="emerald" name="Islamic Golden Age" period="800–1400">
          <EraDomain name="Science">
            <EraHighlight>Algebra, optics</EraHighlight>
          </EraDomain>
        </EraColumn>
      </EraComparison>,
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "Renaissance" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Islamic Golden Age" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1400–1600")).toBeInTheDocument();
    expect(screen.getByText("800–1400")).toBeInTheDocument();
    expect(screen.getByText("Mediterranean")).toBeInTheDocument();
    expect(container.querySelector("article")).toHaveAttribute(
      "data-color",
      "amber",
    );
    expect(container.querySelector("section[data-domain]")).toHaveAttribute(
      "data-domain",
      "Art",
    );
  });

  it("renders the domain heading and highlights, omitting the period chip without a period", () => {
    renderEra(<EraHighlight>Perspective painting</EraHighlight>);
    expect(
      screen.getByRole("heading", { level: 4, name: "Art" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Perspective painting")).toBeInTheDocument();
    expect(screen.queryByText(/^\d{3,4}/)).not.toBeInTheDocument();
  });

  it("EraFigure renders as a span with a forwarded ref by default", () => {
    const ref = createRef<HTMLAnchorElement | HTMLSpanElement>();
    renderEra(<EraFigure name="Leonardo" ref={ref} />);
    expect(screen.getByText("Leonardo").tagName).toBe("SPAN");
    expect(ref.current?.tagName).toBe("SPAN");
  });

  it("EraFigure renders as a link with ref and anchorProps when href is set", () => {
    const ref = createRef<HTMLAnchorElement | HTMLSpanElement>();
    renderEra(
      <EraFigure
        anchorProps={{ rel: "noopener", target: "_blank" }}
        href="/figures/leonardo"
        name="Leonardo"
        ref={ref}
      />,
    );
    const link = screen.getByRole("link", { name: "Leonardo" });
    expect(link).toHaveAttribute("href", "/figures/leonardo");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
    expect(ref.current?.tagName).toBe("A");
  });
});
