---
name: commit
description: Create a commit, a branch, or a pull request in the Atlas repo, following the project's git rules. Use whenever the user asks to commit, branch, push, or open a PR.
---

# Commit

## 1. Branch

1. Treat `main` and `staging` as protected branches.
2. Never commit on a protected branch.
3. Create a topic branch first when the current branch is protected.
4. Name the branch after the change, in short kebab-case.
5. Commit on the topic branch.

## 2. Push

1. Push after every commit.
2. Set the upstream on the first push of a new branch.
3. Give the user the push command when the push cannot authenticate.
4. Never ask the user for a credential or a token.

## 3. Pull request

1. Open the pull request against `staging`.
2. Never open the pull request against `main`.
3. Give the user the pull request URL after the push succeeds.
4. Build the URL as `https://github.com/AtlasHukuk/atlas/compare/staging...<branch>?expand=1`.
