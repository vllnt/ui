import { fireEvent, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { Curriculum, CurriculumLesson, CurriculumModule } from "./curriculum";

describe("Curriculum", () => {
  describe("rendering", () => {
    it("renders with title", () => {
      const { getByText } = render(
        <Curriculum title="Full-Stack Development">
          <div />
        </Curriculum>,
      );
      expect(getByText("Full-Stack Development")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <Curriculum className="custom-class" title="Test">
          <div />
        </Curriculum>,
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("renders totalHours when provided", () => {
      const { getByText } = render(
        <Curriculum title="Course" totalHours={40}>
          <div />
        </Curriculum>,
      );
      expect(getByText("40h total")).toBeInTheDocument();
    });

    it("does not render hours label when totalHours is omitted", () => {
      const { queryByText } = render(
        <Curriculum title="Course">
          <div />
        </Curriculum>,
      );
      expect(queryByText(/total/)).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("does not expose a tree role for the module list", () => {
      const { queryByRole } = render(
        <Curriculum title="Course">
          <div />
        </Curriculum>,
      );
      expect(queryByRole("tree")).not.toBeInTheDocument();
    });
  });
});

describe("CurriculumModule", () => {
  const wrapper = (children: ReactNode) => (
    <Curriculum defaultExpandedModules={["mod-1"]} title="Course">
      {children}
    </Curriculum>
  );

  it("renders module title", () => {
    const { getByText } = render(
      wrapper(
        <CurriculumModule id="mod-1" title="Module 1: Foundations">
          <div />
        </CurriculumModule>,
      ),
    );
    expect(getByText("Module 1: Foundations")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    const { getByText } = render(
      wrapper(
        <CurriculumModule
          description="Core web technologies"
          id="mod-1"
          title="Module 1"
        >
          <div />
        </CurriculumModule>,
      ),
    );
    expect(getByText("Core web technologies")).toBeInTheDocument();
  });

  it("renders estimatedHours when provided", () => {
    const { getByText } = render(
      wrapper(
        <CurriculumModule estimatedHours={8} id="mod-1" title="Module 1">
          <div />
        </CurriculumModule>,
      ),
    );
    expect(getByText("8h")).toBeInTheDocument();
  });

  it("keeps collapsed lessons out of the accessible tree until expanded", () => {
    const { getByRole, queryByRole } = render(
      <Curriculum title="Course">
        <CurriculumModule id="mod-1" title="Module 1">
          <CurriculumLesson href="/lessons/html" title="HTML Basics" />
        </CurriculumModule>
      </Curriculum>,
    );

    expect(
      queryByRole("link", { name: "HTML Basics" }),
    ).not.toBeInTheDocument();

    fireEvent.click(getByRole("button", { name: /module 1/i }));

    expect(
      getByRole("link", { name: "Available HTML Basics" }),
    ).toBeInTheDocument();
  });

  it("removes lesson progress when a lesson unmounts", () => {
    const { getByText, queryByText, rerender } = render(
      <Curriculum defaultExpandedModules={["mod-1"]} title="Course">
        <CurriculumModule id="mod-1" title="Module 1">
          <CurriculumLesson
            id="lesson-1"
            status="completed"
            title="HTML Basics"
          />
        </CurriculumModule>
      </Curriculum>,
    );

    expect(getByText("1/1")).toBeInTheDocument();

    rerender(
      <Curriculum defaultExpandedModules={["mod-1"]} title="Course">
        <CurriculumModule id="mod-1" title="Module 1">
          {null}
        </CurriculumModule>
      </Curriculum>,
    );

    expect(queryByText("1/1")).not.toBeInTheDocument();
  });

  it("tracks duplicate lesson titles independently when ids are omitted", () => {
    const { getByText } = render(
      <Curriculum defaultExpandedModules={["mod-1"]} title="Course">
        <CurriculumModule id="mod-1" title="Module 1">
          <CurriculumLesson status="completed" title="Duplicate" />
          <CurriculumLesson status="completed" title="Duplicate" />
        </CurriculumModule>
      </Curriculum>,
    );

    expect(getByText("2/2")).toBeInTheDocument();
  });

  it("throws when used outside Curriculum", () => {
    expect(() =>
      render(
        <CurriculumModule id="mod-1" title="Module">
          <div />
        </CurriculumModule>,
      ),
    ).toThrow("CurriculumModule must be used within a Curriculum");
  });
});

describe("CurriculumLesson", () => {
  const wrapper = (children: ReactNode) => (
    <Curriculum defaultExpandedModules={["mod-1"]} title="Course">
      <CurriculumModule id="mod-1" title="Module 1">
        {children}
      </CurriculumModule>
    </Curriculum>
  );

  it("renders lesson title", () => {
    const { getByText } = render(
      wrapper(<CurriculumLesson title="HTML & Semantic Markup" />),
    );
    expect(getByText("HTML & Semantic Markup")).toBeInTheDocument();
  });

  it("renders duration when provided", () => {
    const { getByText } = render(
      wrapper(<CurriculumLesson duration="45 min" title="HTML Basics" />),
    );
    expect(getByText("45 min")).toBeInTheDocument();
  });

  it("renders difficulty badge when provided", () => {
    const { getByText } = render(
      wrapper(<CurriculumLesson difficulty="beginner" title="HTML Basics" />),
    );
    expect(getByText("beginner")).toBeInTheDocument();
  });

  it("renders as anchor when href provided and not locked", () => {
    const { container } = render(
      wrapper(
        <CurriculumLesson
          href="/lessons/html"
          status="available"
          title="HTML Basics"
        />,
      ),
    );
    expect(
      container.querySelector("a[href='/lessons/html']"),
    ).toBeInTheDocument();
  });

  it("does not render anchor when status is locked", () => {
    const { container, getByText } = render(
      wrapper(
        <CurriculumLesson
          href="/lessons/html"
          status="locked"
          title="HTML Basics"
        />,
      ),
    );
    expect(container.querySelector("a")).not.toBeInTheDocument();
    expect(getByText("Locked")).toBeInTheDocument();
    expect(
      getByText((_, element) => element?.textContent === " (Locked)"),
    ).toBeInTheDocument();
  });

  it("applies completed style when status is completed", () => {
    const { getByText } = render(
      wrapper(<CurriculumLesson status="completed" title="HTML Basics" />),
    );
    expect(getByText("HTML Basics")).toHaveClass("line-through");
  });
});
