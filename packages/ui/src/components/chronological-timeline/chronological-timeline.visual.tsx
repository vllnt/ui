import { expect, test } from "@playwright/experimental-ct-react";

import {
  ChronoEvent,
  ChronologicalTimeline,
} from "./chronological-timeline";

test.describe("ChronologicalTimeline Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <ChronologicalTimeline title="The Space Race">
        <ChronoEvent
          date="October 4, 1957"
          id="sputnik"
          subtitle="First artificial satellite"
          title="Sputnik 1"
        >
          <p>
            The Soviet Union launched Sputnik 1, kicking off the space age and
            the race to the Moon.
          </p>
          <blockquote>That ball in the sky changed everything.</blockquote>
        </ChronoEvent>
        <ChronoEvent
          date="April 12, 1961"
          id="vostok"
          subtitle="First human in space"
          title="Vostok 1"
        >
          <p>
            Yuri Gagarin orbited Earth aboard Vostok 1 in 108 minutes.
          </p>
        </ChronoEvent>
        <ChronoEvent
          date="July 20, 1969"
          featured
          id="apollo"
          subtitle="First crewed Moon landing"
          title="Apollo 11"
        >
          <p>
            Neil Armstrong and Buzz Aldrin became the first humans to walk on
            the Moon, watched live by 600 million people.
          </p>
        </ChronoEvent>
      </ChronologicalTimeline>,
    );
    await expect(component).toHaveScreenshot(
      "chronological-timeline-default.png",
    );
  });
});
