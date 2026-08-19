# Consumer

The consumer owns the **subscription and the acknowledgement**.

## 1. Responsibility

1. Subscribe to a queue in the source root.
2. Call one function of [packages/api](../../packages/api) for every message.
3. Name that API file and function with a `consume` prefix.
4. Read the identifier from the message, and throw the non-retryable error when
   a required field is absent.
5. Re-enter the log context, taking the trace id and user id from the payload.
6. Log the start, the completion, and the failure, and re-throw after the failure.
7. Make every handler idempotent.

## 2. Layout

1. Keep the process wiring,and the health server in the source root.

## 3. May use

1. One function of the API package.
2. [packages/rabbitmq](../../packages/rabbitmq) to subscribe.
3. The `NonRetryableError` from [packages/rabbitmq](../../packages/rabbitmq).
4. The logger and the log events from [packages/service](../../packages/service) package.

## 4. Must not

1. Never call two API functions from one endpoint.
2. Never call a service or a boundary package.
3. Never put a business rule here.
4. Never put a domain logic here.
