import { Activity, Bot, Compass, Layers3, Sparkles } from "lucide-react";

import { BottomBar } from "../bottom-bar";
import { Button } from "../button";
import { CanvasView } from "../canvas-view";
import { ChatDockSection } from "../chat-dock-section";
import { GlassPanel } from "../glass-panel";
import { LeftRail } from "../left-rail";
import { RightDock } from "../right-dock";
import { TopBar } from "../top-bar";
import { WorkspaceSwitcher } from "../workspace-switcher";

import { CanvasShell } from "./canvas-shell";

function DemoLeftBar() {
  return (
    <GlassPanel className="overflow-hidden">
      <LeftRail
        className="w-[5rem] border-0 bg-transparent px-3 py-4"
        footer={
          <Button aria-label="Runs" size="icon" type="button" variant="ghost">
            <Activity className="size-4" />
          </Button>
        }
        title="Mode"
      >
        <Button
          aria-label="Overview"
          size="icon"
          type="button"
          variant="secondary"
        >
          <Compass className="size-4" />
        </Button>
        <Button aria-label="Objects" size="icon" type="button" variant="ghost">
          <Layers3 className="size-4" />
        </Button>
        <Button aria-label="Agents" size="icon" type="button" variant="ghost">
          <Bot className="size-4" />
        </Button>
      </LeftRail>
    </GlassPanel>
  );
}

function DemoTopBar() {
  return (
    <GlassPanel>
      <TopBar
        className="border-0 bg-transparent px-5 font-sans"
        leading={
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
        }
        subtitle="Calm operating surface"
        title="Operator workspace"
        trailing={
          <Button size="sm" type="button" variant="outline">
            Open command
          </Button>
        }
      >
        <WorkspaceSwitcher
          className="bg-background/60"
          defaultValue="orchestrate"
          workspaces={[
            { id: "orchestrate", label: "Orchestrate" },
            { id: "objects", label: "Objects" },
            { id: "signals", label: "Signals" },
          ]}
        />
      </TopBar>
    </GlassPanel>
  );
}

function DemoRightBar() {
  return (
    <GlassPanel className="h-full overflow-hidden">
      <RightDock
        className="h-full min-w-[22rem] max-w-[22rem] border-0 bg-transparent"
        footer={
          <div className="text-xs text-muted-foreground">
            Chat stays contextual and secondary to the center workspace.
          </div>
        }
        header={
          <div className="text-xs text-muted-foreground">
            Context shifts by route while the shell stays stable.
          </div>
        }
        title="Context"
      >
        <div className="space-y-4">
          <ChatDockSection
            contextLabel="Today · overview"
            messages={[
              {
                body: "Three failed runs came in overnight. Start with the invoice retry and the security digest.",
                id: "assistant",
                speaker: "Assistant",
              },
              {
                body: "Queue the approvals first, then review the stale automations after lunch.",
                id: "operator",
                speaker: "Operator",
              },
            ]}
          />
          <div className="rounded-2xl border border-border/70 bg-background/75 p-4 shadow-[0_10px_35px_hsl(var(--foreground)/0.06)] backdrop-blur-xl">
            <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Selected context
            </div>
            <div className="mt-2 text-sm font-medium text-foreground">
              Inbox triage
            </div>
            <div className="mt-2 text-sm leading-6 text-muted-foreground">
              Landing route keeps the assistant close to the operational queue
              instead of taking over the center canvas.
            </div>
          </div>
        </div>
      </RightDock>
    </GlassPanel>
  );
}

function DemoBottomBar() {
  return (
    <GlassPanel>
      <BottomBar
        center={
          <>
            <div className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
              3 errors
            </div>
            <div className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
              7 awaiting action
            </div>
          </>
        }
        leading={
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="size-4" />
            System healthy enough to proceed
          </div>
        }
        trailing={
          <Button size="sm" type="button" variant="ghost">
            Open inbox
          </Button>
        }
      />
    </GlassPanel>
  );
}

function DemoCanvasObjects() {
  return (
    <div className="relative h-[1200px] w-[1600px] overflow-hidden rounded-[28px] border border-border/12 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.07),transparent_38%),linear-gradient(180deg,hsl(var(--background)/0.18),hsl(var(--background)/0.04))]">
      <div className="absolute left-[14%] top-[22%] w-72 rounded-[2rem] border border-border/18 bg-background/18 p-5 shadow-[0_22px_80px_hsl(var(--foreground)/0.05)] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Layers3 className="size-5" />
          </div>
          <div className="h-2 w-2 rounded-full bg-primary/50" />
        </div>
        <div className="mt-5 space-y-3">
          <div className="h-3 w-24 rounded-full bg-foreground/10" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 rounded-[1.5rem] border border-border/18 bg-background/35" />
            <div className="h-20 rounded-[1.5rem] border border-border/18 bg-background/28" />
          </div>
          <div className="h-10 rounded-[1.25rem] border border-border/18 bg-background/30" />
        </div>
      </div>

      <div className="absolute right-[15%] top-[18%] w-56 rounded-[1.75rem] border border-border/18 bg-background/14 p-4 shadow-[0_18px_60px_hsl(var(--foreground)/0.04)] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-background/60 text-foreground/70">
            <Activity className="size-4" />
          </div>
          <div className="flex gap-1.5">
            <div className="h-2 w-2 rounded-full bg-foreground/10" />
            <div className="h-2 w-2 rounded-full bg-foreground/10" />
            <div className="h-2 w-2 rounded-full bg-primary/45" />
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-3 w-20 rounded-full bg-foreground/10" />
          <div className="space-y-2">
            <div className="h-11 rounded-[1rem] border border-border/18 bg-background/32" />
            <div className="h-11 rounded-[1rem] border border-border/18 bg-background/24" />
            <div className="h-11 rounded-[1rem] border border-border/18 bg-background/18" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-[18%] left-[22%] w-64 rounded-[1.75rem] border border-border/18 bg-background/12 p-4 shadow-[0_18px_60px_hsl(var(--foreground)/0.04)] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-background/55 text-foreground/70">
            <Sparkles className="size-4" />
          </div>
          <div className="h-7 w-16 rounded-full border border-border/18 bg-background/38" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="h-16 rounded-[1rem] border border-border/18 bg-background/26" />
          <div className="h-16 rounded-[1rem] border border-border/18 bg-background/20" />
          <div className="h-16 rounded-[1rem] border border-border/18 bg-background/14" />
        </div>
      </div>
    </div>
  );
}

function CanvasFoundationDemo() {
  return (
    <CanvasShell
      bottomBar={<DemoBottomBar />}
      className="h-[100dvh] min-h-[720px]"
      contentPadding={{ bottom: 120, left: 112, right: 392, top: 112 }}
      leftBar={<DemoLeftBar />}
      rightBar={<DemoRightBar />}
      topBar={<DemoTopBar />}
    >
      <CanvasView
        className="h-full rounded-none border-0 bg-background/25"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <DemoCanvasObjects />
      </CanvasView>
    </CanvasShell>
  );
}

export { CanvasFoundationDemo };
