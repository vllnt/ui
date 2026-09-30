import type { Meta, StoryObj } from "@storybook/react-vite";

import { Curriculum, CurriculumLesson, CurriculumModule } from "./curriculum";

const meta = {
  args: {
    title: "Full-Stack Development",
    totalHours: 40,
    children: (
      <>
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
            prerequisites={["html-basics", "css-layout"]}
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
          <CurriculumLesson
            difficulty="advanced"
            duration="90 min"
            status="locked"
            title="React Patterns"
          />
        </CurriculumModule>
      </>
    ),
  },
  component: Curriculum,
  title: "Learning/Curriculum",
} satisfies Meta<typeof Curriculum>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Expanded: Story = {
  args: {
    defaultExpandedModules: ["mod-1"],
  },
};
