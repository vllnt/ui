// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./navigation-menu";

const guides = [
  { description: "Install the package and add the theme.", href: "#install", title: "Installation" },
  { description: "Compose primitives into product screens.", href: "#patterns", title: "Patterns" },
  { description: "Keyboard, focus and screen reader support.", href: "#a11y", title: "Accessibility" },
];

const meta = {
  args: {
    "aria-label": "Main",
    children: (
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Guides</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[320px] gap-1 p-2">
              {guides.map((guide) => (
                <li key={guide.href}>
                  <NavigationMenuLink
                    className="block rounded-md p-3 hover:bg-accent focus:bg-accent focus:outline-none"
                    href={guide.href}
                  >
                    <span className="block text-sm font-medium">{guide.title}</span>
                    <span className="block text-sm text-foreground/80">
                      {guide.description}
                    </span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#components">
            Components
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#changelog">
            Changelog
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    ),
  },
  component: NavigationMenu,
  title: "Navigation/NavigationMenu",
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
