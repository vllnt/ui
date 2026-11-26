import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { Curriculum, CurriculumLesson, CurriculumModule } from "./curriculum";

const inModule = (children: ReactNode) => (
  <Curriculum defaultExpandedModules={["mod-1"]} title="Course">
    <CurriculumModule id="mod-1" title="Module 1">
      {children}
    </CurriculumModule>
  </Curriculum>
);

describe("Curriculum", () => {
  it("renders title, totalHours, and className", () => {
    const { container } = render(
      <Curriculum
        className="custom-class"
        title="Full-Stack Development"
        totalHours={40}
      >
        <div />
      </Curriculum>,
    );
    expect(screen.getByText("Full-Stack Development")).toBeInTheDocument();
    expect(screen.getByText("40h total")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("omits the hours label and never exposes a tree role", () => {
    render(
      <Curriculum title="Course">
        <div />
      </Curriculum>,
    );
    expect(screen.queryByText(/total/)).not.toBeInTheDocument();
    expect(screen.queryByRole("tree")).not.toBeInTheDocument();
  });
});

describe("CurriculumModule", () => {
  it("renders module title, description, and estimatedHours", () => {
    render(
      <Curriculum defaultExpandedModules={["mod-1"]} title="Course">
        <CurriculumModule
          description="Core web technologies"
          estimatedHours={8}
          id="mod-1"
          title="Module 1: Foundations"
        >
          <div />
        </CurriculumModule>
      </Curriculum>,
    );
    expect(screen.getByText("Module 1: Foundations")).toBeInTheDocument();
    expect(screen.getByText("Core web technologies")).toBeInTheDocument();
    expect(screen.getByText("8h")).toBeInTheDocument();
  });

  it("keeps collapsed lessons out of the accessible tree until expanded", () => {
    render(
      <Curriculum title="Course">
        <CurriculumModule id="mod-1" title="Module 1">
          <CurriculumLesson href="/lessons/html" title="HTML Basics" />
        </CurriculumModule>
      </Curriculum>,
    );
    expect(
      screen.queryByRole("link", { name: "HTML Basics" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /module 1/i }));
    expect(
      screen.getByRole("link", { name: "Available HTML Basics" }),
    ).toBeInTheDocument();
  });

  it("reports the open modules after each toggle", () => {
    const onExpandedModulesChange = vi.fn();
    render(
      <Curriculum
        defaultExpandedModules={["mod-1"]}
        onExpandedModulesChange={onExpandedModulesChange}
        title="Course"
      >
        <CurriculumModule id="mod-1" title="Module 1">
          <CurriculumLesson href="/a" title="A" />
        </CurriculumModule>
        <CurriculumModule id="mod-2" title="Module 2">
          <CurriculumLesson href="/b" title="B" />
        </CurriculumModule>
      </Curriculum>,
    );
    const second = screen.getByRole("button", { name: /module 2/i });
    expect(second).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(second);
    expect(onExpandedModulesChange).toHaveBeenLastCalledWith([
      "mod-1",
      "mod-2",
    ]);
    expect(second).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("button", { name: /module 1/i }));
    expect(onExpandedModulesChange).toHaveBeenLastCalledWith(["mod-2"]);
  });

  it("follows expandedModules when controlled", () => {
    const tree = (expandedModules: string[]) => (
      <Curriculum expandedModules={expandedModules} title="Course">
        <CurriculumModule id="mod-1" title="Module 1">
          <CurriculumLesson href="/a" title="A" />
        </CurriculumModule>
      </Curriculum>
    );
    const { rerender } = render(tree([]));
    const trigger = screen.getByRole("button", { name: /module 1/i });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    rerender(tree(["mod-1"]));
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: /A$/ })).toBeInTheDocument();
  });

  it("removes lesson progress when a lesson unmounts", () => {
    const { rerender } = render(
      inModule(
        <CurriculumLesson
          id="lesson-1"
          status="completed"
          title="HTML Basics"
        />,
      ),
    );
    expect(screen.getByText("1/1")).toBeInTheDocument();
    rerender(inModule(null));
    expect(screen.queryByText("1/1")).not.toBeInTheDocument();
  });

  it("tracks duplicate lesson titles independently when ids are omitted", () => {
    render(
      inModule(
        <>
          <CurriculumLesson status="completed" title="Duplicate" />
          <CurriculumLesson status="completed" title="Duplicate" />
        </>,
      ),
    );
    expect(screen.getByText("2/2")).toBeInTheDocument();
  });

  it("renders module progress during server render", () => {
    const html = renderToStaticMarkup(
      inModule(
        <>
          <CurriculumLesson status="completed" title="Completed lesson" />
          <CurriculumLesson status="available" title="Available lesson" />
        </>,
      ),
    );
    expect(html).toContain("1/2");
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
  it("renders title, duration, difficulty, and an anchor when available", () => {
    const { container } = render(
      inModule(
        <CurriculumLesson
          difficulty="beginner"
          duration="45 min"
          href="/lessons/html"
          status="available"
          title="HTML & Semantic Markup"
        />,
      ),
    );
    expect(screen.getByText("HTML & Semantic Markup")).toBeInTheDocument();
    expect(screen.getByText("45 min")).toBeInTheDocument();
    expect(screen.getByText("beginner")).toBeInTheDocument();
    expect(
      container.querySelector("a[href='/lessons/html']"),
    ).toBeInTheDocument();
  });

  it("does not render anchor when status is locked", () => {
    const { container } = render(
      inModule(
        <CurriculumLesson
          href="/lessons/html"
          status="locked"
          title="HTML Basics"
        />,
      ),
    );
    expect(container.querySelector("a")).not.toBeInTheDocument();
    expect(screen.getByText("Locked")).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => element?.textContent === " (Locked)"),
    ).toBeInTheDocument();
  });

  it("applies completed style when status is completed", () => {
    render(
      inModule(<CurriculumLesson status="completed" title="HTML Basics" />),
    );
    expect(screen.getByText("HTML Basics")).toHaveClass("line-through");
  });
});

describe("Curriculum accessible names", () => {
  it("names the module list as a group and exposes prerequisites as text", () => {
    render(
      inModule(
        <CurriculumLesson
          id="lesson-1"
          prerequisites={["html-basics", "css-layout"]}
          title="Flexbox"
        />,
      ),
    );
    expect(screen.getByRole("group", { name: "Course" })).toBeInTheDocument();
    expect(
      screen.getByText("Requires: html-basics, css-layout"),
    ).toBeInTheDocument();
  });
});
