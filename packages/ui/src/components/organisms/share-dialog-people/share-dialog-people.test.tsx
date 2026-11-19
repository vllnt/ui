import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ShareDialogPeople,
  type ShareDialogPeoplePerson,
  type ShareDialogPeopleRole,
} from "./share-dialog-people";

const personWithoutEmail: ShareDialogPeoplePerson = {
  id: "p3",
  name: "Grace Hopper",
  role: "owner",
};

const people: ShareDialogPeoplePerson[] = [
  { email: "ada@example.com", id: "p1", name: "Ada Lovelace", role: "editor" },
  { email: "alan@example.com", id: "p2", name: "Alan Turing", role: "viewer" },
  personWithoutEmail,
];

const roles: ShareDialogPeopleRole[] = [
  { label: "Viewer", value: "viewer" },
  { label: "Editor", value: "editor" },
  { label: "Owner", value: "owner" },
];

function chooseOption(trigger: HTMLElement, optionName: string): void {
  fireEvent.keyDown(trigger, { key: "ArrowDown" });
  fireEvent.keyDown(screen.getByRole("option", { name: optionName }), {
    key: "Enter",
  });
}

describe("ShareDialogPeople list kind", () => {
  it("renders one entry per person with name, email and a role select", () => {
    render(<ShareDialogPeople people={people} roles={roles} />);
    const entries = screen.getAllByRole("listitem");
    expect(entries).toHaveLength(3);
    expect(entries[0]).toContainElement(screen.getByText("Ada Lovelace"));
    expect(entries[0]).toContainElement(screen.getByText("ada@example.com"));
    expect(entries[1]).toContainElement(screen.getByText("Alan Turing"));
    expect(entries[2]).toContainElement(screen.getByText("Grace Hopper"));
    expect(
      screen.getByRole("combobox", { name: "Ada Lovelace role" }),
    ).toHaveTextContent("Editor");
    expect(
      screen.getByRole("combobox", { name: "Alan Turing role" }),
    ).toHaveTextContent("Viewer");
    expect(
      screen.getByRole("combobox", { name: "Grace Hopper role" }),
    ).toHaveTextContent("Owner");
  });

  it("shows initials when a person has no avatar image", () => {
    render(<ShareDialogPeople people={people} roles={roles} />);
    expect(screen.getByText("AL")).toBeInTheDocument();
    expect(screen.getByText("AT")).toBeInTheDocument();
    expect(screen.getByText("GH")).toBeInTheDocument();
  });

  it("renders the link row with the url and a Copy button", () => {
    const onCopyLink = vi.fn();
    render(
      <ShareDialogPeople
        linkUrl="https://example.com/s/abc"
        onCopyLink={onCopyLink}
        people={people}
        roles={roles}
      />,
    );
    expect(screen.getByRole("textbox", { name: "Share link" })).toHaveValue(
      "https://example.com/s/abc",
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
    expect(onCopyLink).toHaveBeenCalledTimes(1);
    expect(onCopyLink).toHaveBeenCalledWith();
  });

  it("hides the link row without a linkUrl", () => {
    render(<ShareDialogPeople people={people} roles={roles} />);
    expect(
      screen.queryByRole("textbox", { name: "Share link" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Copy link" }),
    ).not.toBeInTheDocument();
  });

  it("calls onRoleChange with the person id and the new role", () => {
    const onRoleChange = vi.fn();
    render(
      <ShareDialogPeople
        onRoleChange={onRoleChange}
        people={people}
        roles={roles}
      />,
    );
    chooseOption(
      screen.getByRole("combobox", { name: "Alan Turing role" }),
      "Editor",
    );
    expect(onRoleChange).toHaveBeenCalledTimes(1);
    expect(onRoleChange).toHaveBeenCalledWith("p2", "editor");
  });

  it("calls onRemove, not onRoleChange, for the Remove choice", () => {
    const onRemove = vi.fn();
    const onRoleChange = vi.fn();
    render(
      <ShareDialogPeople
        onRemove={onRemove}
        onRoleChange={onRoleChange}
        people={people}
        roles={roles}
      />,
    );
    chooseOption(
      screen.getByRole("combobox", { name: "Ada Lovelace role" }),
      "Remove",
    );
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith("p1");
    expect(onRoleChange).not.toHaveBeenCalled();
  });

  it("offers no Remove choice without onRemove", () => {
    render(<ShareDialogPeople people={people} roles={roles} />);
    fireEvent.keyDown(
      screen.getByRole("combobox", { name: "Ada Lovelace role" }),
      { key: "ArrowDown" },
    );
    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(
      screen.queryByRole("option", { name: "Remove" }),
    ).not.toBeInTheDocument();
  });

  it("exposes the open state of a role select through aria-expanded", () => {
    render(<ShareDialogPeople people={people} roles={roles} />);
    const trigger = screen.getByRole("combobox", { name: "Ada Lovelace role" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("moves to the invite form from the Invite button", () => {
    const onKindChange = vi.fn();
    render(
      <ShareDialogPeople
        onKindChange={onKindChange}
        people={people}
        roles={roles}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Invite" }));
    expect(onKindChange).toHaveBeenCalledWith("invite");
  });

  it("calls onDone from the Done button", () => {
    const onDone = vi.fn();
    render(<ShareDialogPeople onDone={onDone} people={people} roles={roles} />);
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledWith();
  });

  it("renders the empty message and no list for an empty people array", () => {
    render(<ShareDialogPeople people={[]} roles={roles} />);
    expect(screen.getByText("No one has access yet.")).toBeVisible();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("omits the email line of a person without an email", () => {
    render(<ShareDialogPeople people={[personWithoutEmail]} roles={roles} />);
    const entry = screen.getByRole("listitem");
    expect(within(entry).getByText("Grace Hopper")).toBeVisible();
    expect(entry.querySelectorAll("p")).toHaveLength(1);
  });

  it("falls back to the raw role value when the role is not in roles", () => {
    render(
      <ShareDialogPeople
        people={[{ id: "p9", name: "Sam Rivera", role: "guest" }]}
        roles={roles}
      />,
    );
    expect(
      screen.getByRole("combobox", { name: "Sam Rivera role" }),
    ).toHaveTextContent("guest");
  });

  it("does not throw when buttons are used without handlers", () => {
    render(
      <ShareDialogPeople
        linkUrl="https://example.com/s/abc"
        people={people}
        roles={roles}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
    fireEvent.click(screen.getByRole("button", { name: "Invite" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    chooseOption(
      screen.getByRole("combobox", { name: "Alan Turing role" }),
      "Owner",
    );
    expect(screen.getByRole("group")).toBeVisible();
  });
});

describe("ShareDialogPeople invite kind", () => {
  it("renders the email input, role select, note, Send and Back", () => {
    render(<ShareDialogPeople kind="invite" people={people} roles={roles} />);
    expect(
      screen.getByRole("textbox", { name: "Email address" }),
    ).toBeVisible();
    expect(
      screen.getByRole("combobox", { name: "Role for the new person" }),
    ).toHaveTextContent("Viewer");
    expect(
      screen.getByText("Invited people get an email with a link."),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Send" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Back" })).toBeVisible();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("describes the email input with the note", () => {
    render(<ShareDialogPeople kind="invite" people={people} roles={roles} />);
    expect(
      screen.getByRole("textbox", { name: "Email address" }),
    ).toHaveAccessibleDescription("Invited people get an email with a link.");
  });

  it("calls onKindChange with list from Back", () => {
    const onKindChange = vi.fn();
    render(
      <ShareDialogPeople
        kind="invite"
        onKindChange={onKindChange}
        people={people}
        roles={roles}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onKindChange).toHaveBeenCalledTimes(1);
    expect(onKindChange).toHaveBeenCalledWith("list");
  });

  it("calls onInvite with the trimmed email and the first role", () => {
    const onInvite = vi.fn();
    render(
      <ShareDialogPeople
        kind="invite"
        onInvite={onInvite}
        people={people}
        roles={roles}
      />,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Email address" }), {
      target: { value: "  new@example.com " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onInvite).toHaveBeenCalledTimes(1);
    expect(onInvite).toHaveBeenCalledWith("new@example.com", "viewer");
  });

  it("calls onInvite with the role chosen in the form", () => {
    const onInvite = vi.fn();
    render(
      <ShareDialogPeople
        kind="invite"
        onInvite={onInvite}
        people={people}
        roles={roles}
      />,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Email address" }), {
      target: { value: "new@example.com" },
    });
    chooseOption(
      screen.getByRole("combobox", { name: "Role for the new person" }),
      "Editor",
    );
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onInvite).toHaveBeenCalledWith("new@example.com", "editor");
  });

  it("does not call onInvite for an empty or invalid email", () => {
    const onInvite = vi.fn();
    render(
      <ShareDialogPeople
        kind="invite"
        onInvite={onInvite}
        people={people}
        roles={roles}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Email address" }), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onInvite).not.toHaveBeenCalled();
  });

  it("renders with no roles and sends an empty role", () => {
    const onInvite = vi.fn();
    render(
      <ShareDialogPeople
        kind="invite"
        onInvite={onInvite}
        people={[]}
        roles={[]}
      />,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Email address" }), {
      target: { value: "new@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onInvite).toHaveBeenCalledWith("new@example.com", "");
  });

  it("does not throw when Send and Back are used without handlers", () => {
    render(<ShareDialogPeople kind="invite" people={people} roles={roles} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Email address" }), {
      target: { value: "new@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("group")).toBeVisible();
  });
});

describe("ShareDialogPeople root", () => {
  it("labels the group with the default title", () => {
    render(<ShareDialogPeople people={people} roles={roles} />);
    const group = screen.getByRole("group", { name: "Share" });
    const heading = screen.getByRole("heading", { name: "Share" });
    expect(group).toHaveAttribute("aria-labelledby", heading.id);
  });

  it("labels the group with a custom title in both kinds", () => {
    const { rerender } = render(
      <ShareDialogPeople people={people} roles={roles} title="Share project" />,
    );
    expect(
      screen.getByRole("group", { name: "Share project" }),
    ).toBeInTheDocument();
    rerender(
      <ShareDialogPeople
        kind="invite"
        people={people}
        roles={roles}
        title="Share project"
      />,
    );
    expect(
      screen.getByRole("group", { name: "Share project" }),
    ).toBeInTheDocument();
  });

  it("renders a close button with an accessible name when onClose is set", () => {
    const onClose = vi.fn();
    render(
      <ShareDialogPeople onClose={onClose} people={people} roles={roles} />,
    );
    const close = screen.getByRole("button", { name: "Close" });
    expect(close).toHaveClass("size-10");
    fireEvent.click(close);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith();
  });

  it("renders no close button without onClose", () => {
    render(<ShareDialogPeople people={people} roles={roles} />);
    expect(
      screen.queryByRole("button", { name: "Close" }),
    ).not.toBeInTheDocument();
  });

  it("replaces default strings with labels, keeping the others", () => {
    render(
      <ShareDialogPeople
        labels={{
          close: "Fermer",
          done: "Terminer",
          personRole: (name) => `Role de ${name}`,
        }}
        onClose={vi.fn()}
        people={people}
        roles={roles}
      />,
    );
    expect(screen.getByRole("button", { name: "Fermer" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Terminer" })).toBeVisible();
    expect(
      screen.getByRole("combobox", { name: "Role de Ada Lovelace" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Invite" })).toBeVisible();
  });

  it("sets the layout and kind data attributes", () => {
    render(<ShareDialogPeople layout="phone" people={people} roles={roles} />);
    const group = screen.getByRole("group");
    expect(group).toHaveAttribute("data-layout", "phone");
    expect(group).toHaveAttribute("data-kind", "list");
  });

  it("defaults to the desktop layout and the list kind", () => {
    render(<ShareDialogPeople people={people} roles={roles} />);
    const group = screen.getByRole("group");
    expect(group).toHaveAttribute("data-layout", "desktop");
    expect(group).toHaveAttribute("data-kind", "list");
  });

  it("merges className, forwards extra props and the ref to the root", () => {
    const ref = { current: null };
    render(
      <ShareDialogPeople
        className="custom-class"
        data-testid="panel"
        people={people}
        ref={ref}
        roles={roles}
      />,
    );
    const panel = screen.getByTestId("panel");
    expect(panel).toHaveClass("custom-class");
    expect(panel.tagName).toBe("SECTION");
    expect(ref.current).toBe(panel);
  });
});
