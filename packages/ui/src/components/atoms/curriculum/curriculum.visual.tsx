import { expect, test } from "@playwright/experimental-ct-react";

import { Curriculum, CurriculumLesson, CurriculumModule } from "./curriculum";

test.describe("Curriculum Visual", () => {
  test("default collapsed", async ({ mount, page }) => {
    await mount(
      <Curriculum title="Full-Stack Development" totalHours={40}>
        <CurriculumModule
          description="Core web technologies"
          estimatedHours={8}
          id="mod-1"
          title="Module 1: Foundations"
        >
          <CurriculumLesson
            difficulty="beginner"
            duration="45 min"
            href="/lessons/html"
            status="completed"
            title="HTML & Semantic Markup"
          />
          <CurriculumLesson
            difficulty="beginner"
            duration="60 min"
            href="/lessons/css"
            status="in-progress"
            title="CSS Layout"
          />
          <CurriculumLesson
            difficulty="intermediate"
            duration="90 min"
            href="/lessons/js"
            prerequisites={["html", "css"]}
            status="locked"
            title="JavaScript Fundamentals"
          />
        </CurriculumModule>
        <CurriculumModule
          description="Modern JavaScript features"
          estimatedHours={10}
          id="mod-2"
          title="Module 2: Advanced Topics"
        >
          <CurriculumLesson
            difficulty="advanced"
            duration="120 min"
            status="locked"
            title="TypeScript Deep Dive"
          />
        </CurriculumModule>
      </Curriculum>,
    );
    await expect(page).toHaveScreenshot("curriculum-default-collapsed.png");
  });

  test("module expanded", async ({ mount, page }) => {
    await mount(
      <Curriculum
        defaultExpandedModules={["mod-1"]}
        title="Full-Stack Development"
        totalHours={40}
      >
        <CurriculumModule
          description="Core web technologies"
          estimatedHours={8}
          id="mod-1"
          title="Module 1: Foundations"
        >
          <CurriculumLesson
            difficulty="beginner"
            duration="45 min"
            href="/lessons/html"
            status="completed"
            title="HTML & Semantic Markup"
          />
          <CurriculumLesson
            difficulty="beginner"
            duration="60 min"
            href="/lessons/css"
            status="in-progress"
            title="CSS Layout"
          />
          <CurriculumLesson
            difficulty="intermediate"
            duration="90 min"
            href="/lessons/js"
            prerequisites={["html", "css"]}
            status="locked"
            title="JavaScript Fundamentals"
          />
        </CurriculumModule>
      </Curriculum>,
    );
    await expect(page).toHaveScreenshot("curriculum-module-expanded.png");
  });
});
