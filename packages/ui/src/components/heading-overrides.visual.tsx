import { expect, test } from "@playwright/experimental-ct-react";

import { ActivityHeatmap } from "./activity-heatmap/activity-heatmap";
import { CandlestickChart } from "./candlestick-chart/candlestick-chart";
import { Checklist } from "./checklist/checklist";
import { Exercise } from "./exercise/exercise";
import { FAQ } from "./faq/faq";
import { Glossary, KeyConcept } from "./key-concept/key-concept";
import { LearningObjectives } from "./learning-objectives/learning-objectives";
import { MarketTreemap } from "./market-treemap/market-treemap";
import { OrderBook } from "./order-book/order-book";
import { ProfileSection } from "./profile-section/profile-section";
import { Quiz } from "./quiz/quiz";
import { StatusBoard } from "./status-board/status-board";
import { Step, StepByStep } from "./step-by-step/step-by-step";
import { Watchlist } from "./watchlist/watchlist";
import { WorldClockBar } from "./world-clock-bar/world-clock-bar";


test("learning heading override props expose matching accessible levels", async ({
  mount,
  page,
}) => {
  await mount(
    <div>
      <ProfileSection
        as="h2"
        compact
        dict={{ profile: { name: "Ada Lovelace", tagline: "Computing pioneer" } }}
      />
      <FAQ as="h2">Answers for common setup questions.</FAQ>
      <Quiz as="h2" options={[{ correct: true, label: "Paris" }]} question="Capital city?" />
      <Exercise as="h2" title="Reverse a string">
        Write the implementation.
      </Exercise>
      <LearningObjectives as="h2" objectives={["Ship accessible headings"]} />
      <Checklist
        as="h2"
        items={[{ id: "docs", label: "Document controls" }]}
        title="Launch checklist"
      />
      <StepByStep as="h2" title="Implementation steps">
        <Step title="Add controls">Expose heading props.</Step>
      </StepByStep>
      <Glossary as="h2" title="Market terms">
        <KeyConcept term="Spread">The distance between bid and ask.</KeyConcept>
      </Glossary>
    </div>,
  );

  await expect(page.getByRole("heading", { level: 2, name: "Ada Lovelace" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Frequently Asked Questions" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Capital city?" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Reverse a string" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "What you'll learn" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Launch checklist" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Implementation steps" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Market terms" })).toBeVisible();
});

test("market and status heading override props expose matching accessible levels", async ({
  mount,
  page,
}) => {
  await mount(
    <div>
      <WorldClockBar
        as="h1"
        now="2026-03-15T12:00:00.000Z"
        title="Follow-the-sun handoff"
        zones={[{ city: "London", timeZone: "Europe/London" }]}
      />
      <Watchlist
        as="h1"
        items={[{ change: 1.2, name: "Apple", price: 182.33, symbol: "AAPL" }]}
        title="Priority watchlist"
      />
      <OrderBook
        as="h1"
        asks={[{ price: 185.24, size: 4.2 }]}
        bids={[{ price: 185.18, size: 5.4 }]}
        title="Depth ladder"
      />
      <MarketTreemap as="h1" items={[{ change: 2.6, label: "NVDA", sector: "Semis", value: 980 }]} />
      <ActivityHeatmap
        as="h1"
        data={[{ count: 3, date: "2026-03-02" }]}
        endDate="2026-03-14T00:00:00.000Z"
        title="Deployment activity"
        weeks={2}
      />
      <StatusBoard
        as="h1"
        items={[{ label: "Gateway", status: "healthy", value: "99.98%" }]}
        title="Service health"
      />
      <CandlestickChart
        as="h1"
        data={[{ close: 189.8, high: 191.2, label: "Mon", low: 182.4, open: 184.6 }]}
        title="Price action"
      />
    </div>,
  );

  await expect(page.getByRole("heading", { level: 1, name: "Follow-the-sun handoff" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Priority watchlist" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Order book" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Market treemap" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Deployment activity" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Service health" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Candlestick chart" })).toBeVisible();
});
