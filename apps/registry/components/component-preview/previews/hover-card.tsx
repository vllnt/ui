"use client";

import {
  Button,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@vllnt/ui";

export default function HoverCardPreview() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@vllnt</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">VLLNT UI</h4>
          <p className="text-sm text-muted-foreground">
            A component library built with Radix UI and Tailwind CSS.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
