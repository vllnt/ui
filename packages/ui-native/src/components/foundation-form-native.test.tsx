import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text as NativeText } from "react-native";

import { ThemeProvider } from "../theme/theme-provider";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar/avatar";
import { Banner, BannerAction } from "./banner/banner";
import { EmptyState } from "./empty-state/empty-state";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "./field/field";
import { Fieldset, FieldsetContent, FieldsetLegend } from "./fieldset/fieldset";
import { Grid } from "./grid/grid";
import { InlineInput } from "./inline-input/inline-input";
import { Input } from "./input/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "./input-group/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "./item/item";
import { Label } from "./label/label";
import { Meter } from "./meter/meter";
import { NumberInput } from "./number-input/number-input";
import {
  Panel,
  PanelBody,
  PanelDescription,
  PanelFooter,
  PanelHeader,
  PanelTitle,
} from "./panel/panel";
import { PasswordInput } from "./password-input/password-input";
import { PhoneInput } from "./phone-input/phone-input";
import { SearchBar } from "./search-bar/search-bar";
import { SearchField } from "./search-field/search-field";
import { Separator } from "./separator/separator";
import { Skeleton } from "./skeleton/skeleton";
import { Switch } from "./switch/switch";
import { TextField } from "./text-field/text-field";
import { Textarea } from "./textarea/textarea";

describe("native foundation and form components", () => {
  it("renders representative foundation compositions", () => {
    render(
      <ThemeProvider colorScheme="light">
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
        <Skeleton accessibilityLabel="Loading profile" testID="skeleton" />
        <Item variant="outline">
          <ItemMedia>
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
      </ThemeProvider>,
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
    expect(screen.getByRole("summary")).toHaveTextContent(/No results/);
    expect(screen.getByRole("separator")).toBeOnTheScreen();
    expect(screen.getByLabelText("Loading profile")).toBeOnTheScreen();
    expect(screen.getByText("Profile details")).toBeOnTheScreen();
  });

  it("exposes input, switch, meter, and validation semantics", () => {
    const onCheckedChange = jest.fn();
    render(
      <ThemeProvider colorScheme="dark">
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
        <Field invalid>
          <FieldLabel>Username</FieldLabel>
          <FieldControl accessibilityLabel="Username" value="ada" />
          <FieldDescription>Public identifier</FieldDescription>
          <FieldError>Already used</FieldError>
        </Field>
        <Fieldset accessibilityLabel="Contact fields" disabled>
          <FieldsetLegend>Contact</FieldsetLegend>
          <FieldsetContent>
            <NativeText>Fields</NativeText>
          </FieldsetContent>
        </Fieldset>
      </ThemeProvider>,
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
    expect(screen.getByLabelText("Username")).toHaveProp("aria-invalid", true);
    expect(screen.getByLabelText("Contact fields")).toBeDisabled();
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

    render(
      <ThemeProvider colorScheme="light">
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
        <SearchBar defaultValue="  native  " onSearch={onSearch} />
      </ThemeProvider>,
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

    fireEvent.press(screen.getAllByRole("button", { name: "Increment" })[0]);
    expect(onNumberChange).toHaveBeenCalledWith(3);
    fireEvent(
      screen.UNSAFE_getByProps({
        accessibilityLabel: "Disabled quantity",
        accessibilityRole: "spinbutton",
      }),
      "accessibilityAction",
      { nativeEvent: { actionName: "increment" } },
    );
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
    fireEvent.press(screen.getByRole("button", { name: "Search" }));
    expect(onSearch).toHaveBeenCalledWith("native");
  });
});
