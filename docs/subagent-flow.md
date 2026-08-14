# Subagent Flow

## 1. The gate

1. Do the work inline in the main conversation by default, at any size.
2. Spawn a subagent only when the current message of the user holds the literal phrase `use subagents`.
3. Spawn a subagent only when the current message of the user names an agent.
4. Treat the gate as valid for one message.
5. The gate does not carry to the next turn, and the end of a flow does not open it again.
6. Let nothing else open the gate.
7. The size of the task, the complexity, an agent description, and an earlier message do not open the gate.
8. Say in one sentence that the flow would help, and then continue inline.
9. Never ask for permission to spawn.

## 2. Entry — one owner agent for the whole request

1. Choose exactly one owner agent.
2. Run exactly one flow, exactly once.
3. Choose feature-developer for a new feature, or for an extension of one.
4. Choose bug-fixer for a bug or a regression.
5. Choose db-schema-specialist for schema work and repository work only.
6. Choose test-writer for test-only work.
7. Choose docs-maintainer to audit the documents against the code.

## 3. Plan

1. Spawn task-planner first for a feature that spans more than one file.
2. Pass the plan of task-planner to the owner without a change.
3. Skip the planning step for work in one file.

## 4. Implement

1. Let the owner make the change.
2. Let every owner except docs-maintainer run the validation loop.
3. Let that owner spawn the validator and the reviewer as its own children.
4. Never spawn a validator, a reviewer, a second owner, or a cleanup agent from the main conversation.
5. Expect docs-maintainer to change nothing, because it only audits.
6. Let docs-maintainer return its report directly.

## 5. Exit — the flow ends when the owner returns

1. Read the status line and the verdict line that the owner quoted.
2. Report what changed when the owner returned a passing status and a passing verdict.
3. Report the schema that the user must push with that same report.
4. Report the failure word for word in every other case.
5. A round cap, a block, and a conflicting rule are such cases.
6. Never spawn the owner again to retry.
7. Never fix the failure inline.
8. Ask the user how to continue.
9. Read the drift report of docs-maintainer directly.
10. Summarize the drift it found, and relay every finding that needs your decision.
11. Begin a new flow only from a new user message that opens the gate again.

## 6. The validation loop

1. Treat this section as the only definition of the loop.
2. An agent file references this section and never restates it.
3. Run the loop yourself as an owner agent after you make a change.
4. Never run the loop from the main conversation.
5. Spawn the validator synchronously.
6. Give the validator the changed files and a one-paragraph summary of the change.
7. Expect the validator to be read-only, because it runs the quality gate and edits nothing.
8. Never let an agent other than the validator run a quality-check command in this flow.
9. Apply every fix yourself, and format the files that you touched.
10. You hold the context of the change, and the validator does not.
11. Fix the failures and spawn the validator again.
12. Tell the validator what failed before.
13. Run a maximum of three validation rounds.
14. Spawn the reviewer on the diff after the validation passes.
15. Verify each blocking finding against the current code first, because the output of the reviewer can be stale.
16. Fix each verified finding.
17. Return to the validation loop before you review again.
18. Run a maximum of two review rounds.
19. Stop at either cap, and report exactly what still fails.
20. Quote the last status line or verdict line word for word.
21. Treat a reported cap as a valid end to the loop.
22. Never treat a reported cap as a reason to spawn another agent.
