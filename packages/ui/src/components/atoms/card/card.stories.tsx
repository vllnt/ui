// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const meta = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Usage this month</CardTitle>
          <CardDescription>Requests across every project.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold tabular-nums">12,840</p>
        </CardContent>
        <CardFooter>
          <p className="text-sm">Resets on the 1st.</p>
        </CardFooter>
      </>
    ),
    className: "w-80",
  },
  component: Card,
  title: "Content/Card",
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
