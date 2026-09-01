# Subagent Flow

## 1. The gate

1. Perform the work inline by default for all task sizes.
2. The gate is valid for one message only.
3. Never let other events open the gate.
4. The size of the task, the task complexity, an agent description, an earlier message, and the end of a flow do not open the gate.
5. Never ask for permission to start a subagent.
6. State in one sentence that the flow can help.
7. Continue the work inline.

## 2. Entry — one owner agent for the whole request

Choose exactly one owner agent, and run exactly one flow, exactly once.

| Work                                  | Owner                |
| ------------------------------------- | -------------------- |
| A new feature, or an extension of one | feature-developer    |
| A bug, or a regression                | bug-fixer            |
| Schema work and repository work       | db-schema-specialist |
| Test-only work                        | test-writer          |
| An audit of the documents             | docs-maintainer      |
| A sweep of one flow against the rules | apply-rules          |

## 3. Plan

1. Spawn task-planner first for a feature that spans more than one file.
2. Pass the plan of task-planner to the owner without a change.
3. Skip this step for work in one file.

## 4. Implement

1. Let the owner make the change, and then run the validation loop in § 6.
2. Never spawn a validator, a reviewer, a second owner, or a cleanup agent from the main conversation.
3. Expect docs-maintainer to change nothing and to run no loop, because it only audits, and let it return its report directly.

## 5. Exit — the flow ends when the owner returns

1. Read the status line and the verdict line that the owner quoted.
2. Report what changed when both lines pass, and report the schema that the user must push in that same report.
3. Report the failure word for word in every other case. A round cap, a block, and a conflicting rule are such cases.
4. Never spawn the owner again, and never fix the failure inline. Ask the user how to continue.
5. Summarize the drift report of docs-maintainer, and relay every finding that needs your decision.
6. Begin a new flow only from a new user message that opens the gate again.

## 6. The validation loop

Treat this section as the only definition of the loop. An agent file references
this section and never restates it. Run the loop as an owner agent after you
make a change, and never from the main conversation.

1. Spawn the validator synchronously, and give it the changed files and a one-paragraph summary of the change.
2. Fix every failure yourself, and format the files that you touched, because you hold the context of the change and the validator does not.
3. Spawn the validator again, and tell it what failed before. Run a maximum of three validation rounds.
4. Spawn the reviewer on the diff after the validation passes.
5. Verify each finding against the current code first, because the output of the reviewer can be stale.
6. Treat each BLOCKER and each WARN as one fix task, and fix the BLOCKERs first. Treat a NIT as optional, unless the user asked for a cleanup.
7. Return to the validation loop before you review again. Run a maximum of two review rounds.
8. Stop at either cap, report exactly what still fails, and quote the last status line or verdict line word for word.

Expect the validator to be read-only, because it runs the quality gate and edits
nothing. Never let another agent run a quality-check command in this flow. Let
apply-rules run `pnpm lint` and `pnpm typecheck` between its iterations, and
never the whole gate. Treat a reported cap as a valid end to the loop, and never
as a reason to spawn another agent.
