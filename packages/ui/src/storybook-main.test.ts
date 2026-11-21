import main from "../.storybook/main";

describe("Storybook main config", () => {
  // The Cloudflare zone injects the Web Analytics beacon. A tag from this
  // config posts to the wrong endpoint and fails. A manager head is where
  // the old tag lived, so adding one must change this test on purpose. The
  // built-HTML grep in storybook.yml checks what ships.
  it("sets no manager head, so no analytics tag rides in it", () => {
    expect(main.managerHead).toBeUndefined();
  });
});
