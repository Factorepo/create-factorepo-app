# Atlas — Agent Instructions

Edit this file, never `CLAUDE.md`.

## Before you read anything

1. Never read `docs-archive/`, for any reason.
2. Never change a file in `docs-archive/`, for any reason.
3. Start a subagent only if the message from the user contains the exact phrase `use subagents` or names an owner agent of [docs/subagent-flow.md](docs/subagent-flow.md) § 2.
4. Never start `code-validator` or `code-reviewer` from the main conversation, even when the user names one. [docs/subagent-flow.md](docs/subagent-flow.md) § 6 owns them.
5. Never read `.env`, for any reason.
6. Never use a command to show the content of `.env`. Examples include `cat`, `grep`, `sed`, and `head`.
7. Read `.env.example` when you must know the name of a variable.
8. Ask the user for one value when `.env.example` is not sufficient.

## What to read

| Document                                       | Read                                    |
| ---------------------------------------------- | --------------------------------------- |
| [docs/rules.md](docs/rules.md)                 | Before anything else, every single time |
| [docs/subagent-flow.md](docs/subagent-flow.md) | Before spawning any subagent            |
