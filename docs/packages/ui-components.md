# UI Components

This file is the catalog of the shadcn registry, and the state of each component in this workspace.

## 1. Responsibility

1. List every component of the shadcn registry here.
2. Record the components that this workspace holds.
3. Keep every rule about a UI component in [ui.md](ui.md). This file holds no rule.

## 2. The base

The shadcn registry publishes a component for three bases: `radix`, `base`, and `aria`.

This workspace uses the **radix** base. [packages/ui](../../packages/ui) depends on the `radix-ui` package.

Read the documentation of a component at `https://ui.shadcn.com/docs/components/radix/<name>`.

## 3. Installed

| File                | Import                   | Registry name   |
| ------------------- | ------------------------ | --------------- |
| `button.tsx`        | `@acme/ui/button`        | `button`        |
| `dropdown-menu.tsx` | `@acme/ui/dropdown-menu` | `dropdown-menu` |
| `field.tsx`         | `@acme/ui/field`         | `field`         |
| `input.tsx`         | `@acme/ui/input`         | `input`         |
| `label.tsx`         | `@acme/ui/label`         | `label`         |
| `separator.tsx`     | `@acme/ui/separator`     | `separator`     |
| `toast.tsx`         | `@acme/ui/toast`         | `sonner`        |
| `theme.tsx`         | `@acme/ui/theme`         | none            |

The package root `@acme/ui` exports the class-name helper `cn`, and no component.

### 3.1 Two names that do not agree

1. Read `toast.tsx` as the registry component `sonner`. The file wraps `Toaster` from the `sonner` package. The registry also publishes a different component with the name `toast`. Ask for `sonner`, never for `toast`, when you want the component that this workspace already holds.
2. Read `theme.tsx` as local code. The file composes `next-themes`, `Button`, and `DropdownMenu`. The registry does not publish this component.

## 4. Not installed, radix base

The registry publishes these 49 components for the radix base. This workspace holds none of them.

accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb,
button-group, calendar, card, carousel, chart, checkbox, collapsible,
combobox, command, context-menu, dialog, direction, drawer, empty,
hover-card, input-group, input-otp, item, kbd, menubar, native-select,
navigation-menu, pagination, popover, progress, questionnaire,
radio-group, resizable, scroll-area, select, sheet, sidebar, skeleton,
slider, spinner, switch, table, tabs, textarea, toggle, toggle-group,
tooltip

## 5. Not installed, other base

The registry publishes these 7 components for another base only. They do not match the radix base of this workspace.

| Component          | Base |
| ------------------ | ---- |
| `attachment`       | aria |
| `bubble`           | aria |
| `marker`           | aria |
| `message`          | aria |
| `message-scroller` | aria |
| `toast`            | base |
| `form`             | none |

Tell the user that the component does not match the radix base, before you propose one of these.

## 6. Refresh

Run this command to read the registry again:

```sh
curl -s https://ui.shadcn.com/r/index.json | jq -r '.[].name'
```

Compare the result against section 3, section 4, and section 5. Report a difference to the user.

The lists above show the registry of 2026-09-02. The registry held 63 components on that date.
