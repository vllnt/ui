import { expect, test } from "@playwright/experimental-ct-react";

import { AudioPlayer } from "./audio-player";

function silentWav() {
  const bytes = Buffer.alloc(44 + 16000);
  bytes.write("RIFF"); bytes.writeUInt32LE(bytes.length - 8, 4); bytes.write("WAVEfmt ", 8);
  bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(8000, 24); bytes.writeUInt32LE(16000, 28); bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34); bytes.write("data", 36); bytes.writeUInt32LE(16000, 40);
  return bytes;
}

test("audio controls and keyboard playback", async ({ mount, page }) => {
  await page.route("**/test-audio.wav", (route) => route.fulfill({ contentType: "audio/wav", body: silentWav() }));
  const component = await mount(<AudioPlayer src="/test-audio.wav" title="Interview" transcript="A short interview." showPlaybackRate />);
  await expect(component.getByRole("slider")).toBeEnabled();
  await expect(component).toHaveScreenshot("audio-player-default.png");
  const play = component.getByRole("button", { name: "Play audio" });
  await play.focus();
  await page.keyboard.press("Space");
  await expect(component.getByRole("button", { name: "Pause audio" })).toBeVisible();
  await page.keyboard.press("Space");
  await expect(play).toBeVisible();
  await page.keyboard.press("End");
  await expect(component.getByRole("slider")).toHaveValue("1");
  await page.keyboard.press("Home");
  await expect(component.getByRole("slider")).toHaveValue("0");
});
