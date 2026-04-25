import { Activity, Bot, Compass, Layers3, Sparkles } from "lucide-react";

import { Button } from "../button";
import { CanvasView } from "../canvas-view";
import { LeftRail } from "../left-rail";
import { MiniMapPanel } from "../mini-map-panel";
import { RightDock } from "../right-dock";
import { TopBar } from "../top-bar";
import { WorkspaceSwitcher } from "../workspace-switcher";
import { ZoomHUD } from "../zoom-hud";

import { CanvasShell } from "./canvas-shell";

function DemoLeftRail() {
  return (
    <LeftRail
      footer={
        <Button aria-label="Runs" size="icon" type="button" variant="ghost">
          <Activity className="size-4" />
        </Button>
      }
      title="Mode"
    >
      <Button aria-label="Canvas" size="icon" type="button" variant="secondary">
        <Compass className="size-4" />
      </Button>
      <Button aria-label="Objects" size="icon" type="button" variant="ghost">
        <Layers3 className="size-4" />
      </Button>
      <Button aria-label="Agents" size="icon" type="button" variant="ghost">
        <Bot className="size-4" />
      </Button>
    </LeftRail>
  );
}

function DemoRightDock() {
  return (
    <RightDock
      footer={
        <div className="text-xs text-muted-foreground">
          Dock hosts contextual panels without becoming the canvas.
        </div>
      }
      header={
        <div className="text-xs text-muted-foreground">
          Session objects, runs, and notes stay nearby but secondary.
        </div>
      }
      title="Context Dock"
    >
      <div className="space-y-3">
        <div className="rounded-2xl border border-border/60 bg-muted/40 p-3">
          <div className="text-sm font-medium">Object focus</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Model run summaries and object controls can live here.
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-muted/40 p-3">
          <div className="text-sm font-medium">Command access</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Keyboard-first command affordances remain available without
            occupying the viewport.
          </div>
        </div>
      </div>
    </RightDock>
  );
}

function DemoTopBar() {
  return (
    <TopBar
      leading={
        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-4" />
        </div>
      }
      subtitle="Calm spatial control plane"
      title="Operator workspace"
      trailing={
        <Button size="sm" type="button" variant="outline">
          Open command
        </Button>
      }
    >
      <WorkspaceSwitcher
        defaultValue="orchestrate"
        workspaces={[
          {
            description: "Runs, operators, and outputs",
            id: "orchestrate",
            label: "Orchestrate",
          },
          {
            description: "Objects and relationships",
            id: "objects",
            label: "Objects",
          },
          {
            description: "Signals and logs",
            id: "signals",
            label: "Signals",
          },
        ]}
      />
    </TopBar>
  );
}

function DemoOverlay() {
  return (
    <>
      <div className="pointer-events-auto absolute bottom-4 left-4">
        <MiniMapPanel
          markers={[
            { id: "run", label: "Run stream", x: 320, y: 240 },
            {
              id: "knowledge",
              label: "Knowledge cluster",
              x: 820,
              y: 420,
            },
            { id: "agent", label: "Agent loop", x: 1120, y: 760 },
          ]}
          viewport={{ height: 360, width: 520, x: 300, y: 180, zoom: 1 }}
          world={{ height: 1200, width: 1600 }}
        />
      </div>
      <div className="pointer-events-auto absolute bottom-4 right-4">
        <ZoomHUD zoom={1} />
      </div>
    </>
  );
}

function DemoCanvasObjects() {
  return (
    <div className="relative h-[1200px] w-[1600px]">
      <div className="absolute left-28 top-20 w-72 rounded-[1.5rem] border border-border/60 bg-background/85 p-4 shadow-sm backdrop-blur">
        <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Task cluster
        </div>
        <div className="mt-2 text-lg font-medium">Daily operator sweep</div>
        <div className="mt-2 text-sm text-muted-foreground">
          Pinned objects and active runs can anchor the working field without
          turning it into a whiteboard.
        </div>
      </div>
      <div className="absolute left-[32rem] top-[18rem] w-64 rounded-[1.5rem] border border-border/60 bg-background/85 p-4 shadow-sm backdrop-blur">
        <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Run output
        </div>
        <div className="mt-2 text-lg font-medium">Synthesis stream</div>
        <div className="mt-2 text-sm text-muted-foreground">
          Contextual detail remains inspectable from the dock while the viewport
          stays spacious.
        </div>
      </div>
      <div className="absolute left-[62rem] top-[34rem] w-80 rounded-[1.5rem] border border-border/60 bg-background/85 p-4 shadow-sm backdrop-blur">
        <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Agent lane
        </div>
        <div className="mt-2 text-lg font-medium">Reasoning path</div>
        <div className="mt-2 text-sm text-muted-foreground">
          Spatial grouping helps operators read object neighborhoods and
          transitions at a glance.
        </div>
      </div>
    </div>
  );
}

function CanvasFoundationDemo() {
  return (
    <CanvasShell
      className="h-[760px]"
      leftRail={<DemoLeftRail />}
      rightDock={<DemoRightDock />}
      topBar={<DemoTopBar />}
    >
      <CanvasView
        className="h-full"
        defaultViewport={{ x: 80, y: 56, zoom: 1 }}
        overlay={<DemoOverlay />}
      >
        <DemoCanvasObjects />
      </CanvasView>
    </CanvasShell>
  );
}

export { CanvasFoundationDemo };
