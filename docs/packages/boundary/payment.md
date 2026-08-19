# Payment

Read [../../boundary-rules.md](../../boundary-rules.md) first.

## 1. The webhook

1. Verify the signature here, with the webhook secret and never the API key.
2. Read the raw body, and throw when the verification fails.
3. Never read a field of the payload before the verification passes.
