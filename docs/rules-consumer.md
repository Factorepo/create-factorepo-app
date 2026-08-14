# Consumer Rules

## 1. Shape

1. Follow the layering rules in [rules-backend.md](rules-backend.md), which the worker shares.
2. Follow the folder-structure rules in the same file.
3. Give the worker no HTTP surface except its health endpoint.
4. Give the worker one subscription service per queue.
5. Keep a worker-local repository in the worker.
6. Reach shared data through the shared packages.

## 2. Log context

1. Re-enter the log context of the publisher on every message.
2. Do this before you start any work.
3. Read the trace id and the user from the message payload.
4. Never generate a new trace id here.
5. Treat a background job as a bug when you cannot join its logs to the request that caused it.

## 3. Object storage

1. Delete a stored object only in the worker.
2. Delete it only after the database commits the extracted content.
3. Log a failed delete.
4. Let the message succeed after a failed delete.

## 4. Testing

1. Follow the integration-test rules in [rules-backend.md](rules-backend.md), which the worker suite shares.
2. Treat a subscription service without a test file as unfinished.
3. Write one test file per subscription service.
4. Assert that the database holds the extracted content.
5. Assert that the stored object is gone after the worker handles the message.
