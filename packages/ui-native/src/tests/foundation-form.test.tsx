import { fireEvent, screen } from "@testing-library/react-native";
import { Text as NativeText } from "react-native";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../components/atoms/avatar/avatar";
import { EmptyState } from "../components/atoms/empty-state/empty-state";
import {
  Fieldset,
  FieldsetContent,
  FieldsetLegend,
} from "../components/atoms/fieldset/fieldset";
import { Grid } from "../components/atoms/grid/grid";
import { Input } from "../components/atoms/input/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../components/atoms/item/item";
import { Label } from "../components/atoms/label/label";
import { Meter } from "../components/atoms/meter/meter";
import {
  Panel,
  PanelBody,
  PanelDescription,
  PanelFooter,
  PanelHeader,
  PanelTitle,
} from "../components/atoms/panel/panel";
import { Separator } from "../components/atoms/separator/separator";
import { Skeleton } from "../components/atoms/skeleton/skeleton";
import { Switch } from "../components/atoms/switch/switch";
import { Banner, BannerAction } from "../components/molecules/banner/banner";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../components/molecules/field/field";
import { InlineInput } from "../components/molecules/inline-input/inline-input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../components/molecules/input-group/input-group";
import { NumberInput } from "../components/molecules/number-input/number-input";
import { PasswordInput } from "../components/molecules/password-input/password-input";
import { PhoneInput } from "../components/molecules/phone-input/phone-input";
import { SearchBar } from "../components/molecules/search-bar/search-bar";
import { SearchField } from "../components/molecules/search-field/search-field";
import { TextField } from "../components/molecules/text-field/text-field";
import { Textarea } from "../components/molecules/textarea/textarea";

import { renderThemed } from "./test-utils";

it("renders representative foundation compositions", () => {
  renderThemed(
    <>
      <Avatar testID="avatar">
        <AvatarImage
          accessibilityLabel="Ada Lovelace portrait"
          source={{ uri: "https://example.com/ada.png" }}
        />
        <AvatarFallback>
          <NativeText>AL</NativeText>
        </AvatarFallback>
      </Avatar>
      <Grid cols={2} gap={2} testID="grid">
        <NativeText>One</NativeText>
        <NativeText>Two</NativeText>
      </Grid>
      <Panel testID="panel">
        <PanelHeader>
          <PanelTitle>Settings</PanelTitle>
          <PanelDescription>Workspace preferences</PanelDescription>
        </PanelHeader>
        <PanelBody>
          <NativeText>Body</NativeText>
        </PanelBody>
        <PanelFooter>
          <NativeText>Footer</NativeText>
        </PanelFooter>
      </Panel>
      <EmptyState description="Try another filter" title="No results" />
      <Separator decorative={false} />
      <Separator accessibilityLabel="Section break" decorative={false} />
      <Skeleton accessibilityLabel="Loading profile" testID="skeleton" />
      <Item variant="outline">
        <ItemMedia decorative>
          <NativeText>•</NativeText>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Account</ItemTitle>
          <ItemDescription>Profile details</ItemDescription>
        </ItemContent>
        <ItemActions>
          <NativeText>Edit</NativeText>
        </ItemActions>
      </Item>
    </>,
  );
  expect(screen.getByTestId("avatar")).toBeOnTheScreen();
  expect(screen.getByText("AL")).toBeOnTheScreen();
  fireEvent(
    screen.getByRole("image", { name: "Ada Lovelace portrait" }),
    "load",
    {
      nativeEvent: {
        source: { height: 40, uri: "https://example.com/ada.png", width: 40 },
      },
    },
  );
  expect(screen.queryByText("AL")).not.toBeOnTheScreen();
  expect(screen.getByTestId("grid")).toBeOnTheScreen();
  expect(screen.getByRole("header", { name: "Settings" })).toBeOnTheScreen();
  expect(screen.getByText("No results")).toHaveProp(
    "accessibilityRole",
    "header",
  );
  expect(screen.getByRole("separator")).toHaveProp(
    "accessibilityLabel",
    "Section break",
  );
  expect(screen.getByLabelText("Loading profile")).toBeOnTheScreen();
  expect(screen.getByText("Profile details")).toBeOnTheScreen();
});

it("exposes input, switch, meter, and validation semantics", () => {
  const onCheckedChange = jest.fn();
  renderThemed(
    <>
      <Label>Email</Label>
      <Input accessibilityLabel="Email" disabled value="ada@example.com" />
      <Textarea accessibilityLabel="Biography" value="Mathematician" />
      <Switch
        accessibilityLabel="Notifications"
        checked
        onCheckedChange={onCheckedChange}
      />
      <Meter
        label="Storage used"
        max={10}
        segments={5}
        value={7}
        valueText="7 GB"
      />
      <TextField error="Required" label="Name" value="" />
      <TextField
        accessibilityLabel="Display name"
        label={<NativeText>Name shown to teammates</NativeText>}
        value="Ada"
      />
      <Field invalid>
        <FieldLabel>Username</FieldLabel>
        <FieldControl accessibilityLabel="Username" value="ada" />
        <FieldDescription>Public identifier</FieldDescription>
        <FieldError>Already used</FieldError>
      </Field>
      <Fieldset accessibilityLabel="Contact fields" disabled>
        <FieldsetLegend>Contact</FieldsetLegend>
        <FieldsetContent>
          <Input accessibilityLabel="Contact email" />
          <NativeText>Fields</NativeText>
        </FieldsetContent>
      </Fieldset>
    </>,
    "dark",
  );
  expect(screen.getByLabelText("Email")).toBeDisabled();
  fireEvent(
    screen.getByRole("switch", { name: "Notifications" }),
    "valueChange",
    false,
  );
  expect(onCheckedChange).toHaveBeenCalledWith(false);
  expect(
    screen.getByRole("progressbar", { name: "Storage used" }),
  ).toHaveAccessibilityValue({ max: 10, min: 0, now: 7, text: "7 GB" });
  expect(screen.getByRole("alert", { name: "Required" })).toBeOnTheScreen();
  expect(screen.getByLabelText("Username")).toHaveProp(
    "accessibilityHint",
    "Already used. Public identifier",
  );
  const contactEmail = screen.getByLabelText("Contact email");
  expect(contactEmail).toBeDisabled();
  expect(contactEmail).toHaveProp("accessibilityHint", "Contact fields");
});

it("handles native form interactions and controlled state", () => {
  const onBannerDismiss = jest.fn();
  const onInlineChange = jest.fn();
  const onInlineCommit = jest.fn();
  const onDisabledNumberChange = jest.fn();
  const onNumberChange = jest.fn();
  const onPhoneCountry = jest.fn();
  const onSearch = jest.fn();
  const onSearchValue = jest.fn();
  const onBannerAction = jest.fn();

  renderThemed(
    <>
      <Banner dismissible onDismiss={onBannerDismiss}>
        <NativeText>Maintenance tonight</NativeText>
        <BannerAction onPress={onBannerAction}>
          <NativeText>Details</NativeText>
        </BannerAction>
      </Banner>
      <InputGroup>
        <InputGroupAddon>
          <NativeText>@</NativeText>
        </InputGroupAddon>
        <InputGroupInput accessibilityLabel="Handle" value="ada" />
      </InputGroup>
      <InlineInput
        onChangeText={onInlineChange}
        onCommit={onInlineCommit}
        value="Draft"
      />
      <NumberInput
        accessibilityLabel="Quantity"
        onValueChange={onNumberChange}
        value={2}
      />
      <NumberInput
        accessibilityLabel="Disabled quantity"
        disabled
        onValueChange={onDisabledNumberChange}
        value={2}
      />
      <PasswordInput accessibilityLabel="Password" value="secret" />
      <PhoneInput
        accessibilityLabel="Phone"
        country={{ code: "US", dialCode: "+1", label: "United States" }}
        onPressCountry={onPhoneCountry}
        value="5551234"
      />
      <SearchField
        accessibilityLabel="Filter"
        onValueChange={onSearchValue}
        value="Ada"
      />
      <SearchField
        accessibilityLabel="Disabled filter"
        clearLabel="Clear disabled search"
        disabled
        value="Locked"
      />
      <SearchBar defaultValue="  native  " onSearch={onSearch} />
    </>,
  );
  fireEvent.press(screen.getByRole("button", { name: "Details" }));
  expect(onBannerAction).toHaveBeenCalledTimes(1);
  fireEvent.press(screen.getByRole("button", { name: "Dismiss" }));
  expect(onBannerDismiss).toHaveBeenCalledTimes(1);
  expect(screen.queryByText("Maintenance tonight")).not.toBeOnTheScreen();

  expect(screen.getByLabelText("Handle")).toHaveProp("value", "ada");
  fireEvent.changeText(screen.getByDisplayValue("Draft"), "Final");
  expect(onInlineChange).toHaveBeenCalledWith("Final");
  fireEvent(screen.getByDisplayValue("Draft"), "submitEditing", {
    nativeEvent: { text: "Draft" },
  });
  expect(onInlineCommit).toHaveBeenCalledWith("Draft");

  const [increment, disabledIncrement] = screen.getAllByRole("button", {
    name: "Increment",
  });
  if (!increment || !disabledIncrement) throw new Error("Expected steppers.");
  fireEvent.press(increment);
  expect(onNumberChange).toHaveBeenCalledWith(3);
  expect(disabledIncrement).toBeDisabled();
  fireEvent.press(disabledIncrement);
  expect(onDisabledNumberChange).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole("button", { name: "Show password" }));
  expect(screen.getByLabelText("Password")).toHaveProp(
    "secureTextEntry",
    false,
  );
  fireEvent.press(
    screen.getByRole("button", { name: "Choose country dialing code" }),
  );
  expect(onPhoneCountry).toHaveBeenCalledTimes(1);
  fireEvent.press(screen.getByRole("button", { name: "Clear search" }));
  expect(onSearchValue).toHaveBeenCalledWith("");
  expect(screen.getByLabelText("Disabled filter")).toBeDisabled();
  expect(
    screen.getByRole("button", { name: "Clear disabled search" }),
  ).toBeDisabled();
  fireEvent.press(screen.getByRole("button", { name: "Search" }));
  expect(onSearch).toHaveBeenCalledWith("native");
});
