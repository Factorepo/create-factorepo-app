# Rules

Read this file first, then read [common-rules](./common-rules.md) and [business-rules](./business-rules.md).

## 1. Writing a rule

1. Never change a rule before you ask for confirmation.
2. Treat every rule as a hard constraint, and take the stricter reading.
3. Report the conflict when a document and the code disagree, and never follow the code in silence.
4. Write in ASD-STE100 Simplified Technical English.
5. Write one imperative instruction per sentence, in the active voice.
6. Number a line only when a reviewer can check it against a diff.
7. Give every markdown file under `apps` or `packages` these sections, in this order: **Responsibility**, **Layout**, **May use**, **Must not**, then its own sections. Omit a section when a parent rule file already owns it.
8. Give a rule one home, and never repeat it in another file.

## 2. Dependency direction

`nextjs` -> `api`, `auth`, `ui`

`expo` -> `api` for a type only

`api` -> `service`, a boundary package, and `auth` for a type only

`auth` -> `service`, a boundary package

`service` -> a boundary package

Point every arrow one way, and never back.

A **boundary package** is the only door to one external system, and holds no
business rule. The boundary packages are `db`, `email`, `gemini`, `payment`,
and `storage`.

Use `constants` from every layer.

## 3. Read next

| Path                                                  | Read                                                         |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| [apps/expo](../apps/expo)                             | [apps/expo.md](apps/expo.md)                                 |
| [apps/nextjs](../apps/nextjs)                         | [apps/nextjs.md](apps/nextjs.md)                             |
| [apps/nextjs/src/app/api](../apps/nextjs/src/app/api) | [apps/backend.md](apps/backend.md)                           |
| [packages/api](../packages/api)                       | [packages/api.md](packages/api.md)                           |
| [packages/service](../packages/service)               | [packages/service.md](packages/service.md)                   |
| [packages/auth](../packages/auth)                     | [packages/auth.md](packages/auth.md)                         |
| [packages/constants](../packages/constants)           | [packages/constants.md](packages/constants.md)               |
| [packages/db](../packages/db)                         | [packages/boundary/db.md](packages/boundary/db.md)           |
| [packages/email](../packages/email)                   | [packages/boundary/email.md](packages/boundary/email.md)     |
| [packages/gemini](../packages/gemini)                 | [packages/boundary/gemini.md](packages/boundary/gemini.md)   |
| [packages/payment](../packages/payment)               | [packages/boundary/payment.md](packages/boundary/payment.md) |
| [packages/storage](../packages/storage)               | [packages/boundary/storage.md](packages/boundary/storage.md) |
| [packages/ui](../packages/ui)                         | [packages/ui.md](packages/ui.md)                             |
