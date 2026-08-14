---
name: commit
description: Create a commit, a branch, or a pull request in the Atlas repo, following the project's git rules. Use whenever the user asks to commit, branch, push, or open a PR.
model: haiku
---

# Commit

## 1. Branch

1. Never commit on `main`.
2. Create a topic branch first when the current branch is `main`.
3. Name the branch in short kebab-case, after the change itself.
4. Commit on the topic branch.

## 2. Push

1. Push after every commit.
2. Set the upstream on the first push of a new branch.
3. Give the user the pull request URL after the push succeeds.
4. Build the URL as `https://github.com/AtlasHukuk/atlas/compare/main...<branch>?expand=1`.
