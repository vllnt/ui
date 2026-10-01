// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";

const slides = ["Design", "Build", "Ship", "Measure"];

const meta = {
  component: Carousel,
  parameters: {
    layout: "centered",
  },
  title: "Content/Carousel",
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Carousel aria-label="Release stages" className="mx-12 w-64" {...args}>
      <CarouselContent>
        {slides.map((slide, index) => (
          <CarouselItem aria-label={`${index + 1} of ${slides.length}`} key={slide}>
            <div className="flex aspect-square items-center justify-center rounded-lg border bg-card text-2xl font-semibold text-card-foreground">
              {slide}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};
