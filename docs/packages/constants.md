# Constants

The constants package owns the **shared literal values**. It owns no behavior.

## 1. Responsibility

1. Keep this package as the only home of a shared literal value.
2. Keep it free of runtime dependencies.

## 2. Layout

1. Keep one subject in one file, named for its subject in camel case.
2. Give a group of values that share one shape its own folder, built from its member files in `index.ts`.
3. Export every public name from the index file, with the value and the type in two statements.

## 3. Must not

1. Never put business logic here
2. Never read the environment
3. Never import another workspace package.
4. Never repeat the number of a constant inside a string. Build the string with a template literal.

## 4. Values

1. Name a constant in upper snake case, and write `as const` on every literal array and object.
2. Write a byte size as a multiplication of readable factors.
3. Add a function here only when it parses or formats a constant of this package, and keep it pure.

## 5. Email templates

1. Use the same header, footer, and styles for each template.
2. Make these items in one layout file.
3. Give a unique sender address to each template.
4. Greet the recipient with the name of the recipient.
5. Write a plain text body with each HTML body, and keep the two to the same wording.
6. Address every image with a full URL.
7. Escape every supplied value that goes into the HTML body.
8. Render a parameter that the caller left out as an empty field.
