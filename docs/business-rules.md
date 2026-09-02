# Business Rules

## 1. Errors

1. Write every user-facing message in English.

## 2. Authorization

1. Give every table that a user owns a `createdBy` column, and cascade on
   delete. Give it an `updatedBy` column when another user can change the row.
2. Read the owner from the session in the route adapter, and never from the
   request body.
3. Pass the owner to the endpoint function as one more input field.
4. Scope every read and every write of an owned row to `createdBy`, in the
   repository. Name the method `<verb>ForUser`.
5. Answer not found for a row that the caller does not own.
6. Never answer forbidden for a row that the caller does not own, because that
   answer confirms the row exists.
7. Write the check that turns an absent row into the answer as a guard function
   of [packages/service](packages/service.md).

> A scoped query cannot tell an absent row from one that belongs to somebody
> else, and it must not try. `postGuards.deleted` and `likeGuards.deleted` are
> the worked examples.
