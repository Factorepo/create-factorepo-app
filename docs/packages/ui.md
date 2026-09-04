# UI

The UI package owns the **presentation primitives**.

Read [ui-components.md](ui-components.md) for the catalog of the shadcn registry, and for the components that this workspace holds.

## 1. Responsibility

1. Keep only a presentation component here.
2. Keep the class-name helper as the only export of the package root.
3. Add every component with `pnpm ui:add`, then add a subpath export for it.
4. Get permission from the user before you add a new UI component.
5. Import a component through its subpath.

## 2. Must not

1. Never put business logic here
2. Never read the environment
3. Never import another workspace package.
4. Never write, paste, or hand-edit a component file.
5. Never run `pnpm ui:add` yourself. Ask the user.

## 3. Failure modes

1. Compose the generated component in the app instead of editing it.
2. Report the need to the user when no composition solves the case.
