# RabbitMQ

Read [../../boundary-rules.md](../../boundary-rules.md) first.

## 1. Responsibility

1. Track the connection state from the broker events, and report it through the
   health check.

## 2. Topology

1. Declare every vhost, exchange, queue, binding, publication, and subscription
   in the configuration file, and never in code.
2. Give every queue a dead-letter exchange and its own error queue.
3. Throw at import when the configuration holds no vhost.

## 3. Message

1. Carry an identifier, a timestamp, and the current trace id in every payload.
2. Acknowledge a message only after the handler returns.
3. Republish a failed message three times with a one-second defer, then nack it.

## 4. Error

1. Create a `NonRetryableError` class that extends the `Error` class.
2. If the consumer receives a `NonRetryableError`, do not try the operation again.
