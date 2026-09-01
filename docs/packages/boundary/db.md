# Database

Read [../../boundary-rules.md](../../boundary-rules.md) first.

Create a package for each different database. The package name must be `db` or
`db-*`.

## 1. Responsibility

1. Give it the schema, the client, the repositories, and the push script.
2. Keep a repository to building a query and returning the result.
3. Open every transaction in this package.

## 2. Layout

1. Keep the client and the schema entry point at the source root.
2. Create a folder for each entity in repository.
3. Create a utils folder for helper functions.
4. Put the `<entity>.ts` schema file in this folder.
5. Add an `<entity>Repository.ts` file to this folder only when a caller reads
   or writes the entity.
6. Export each schema file from `schema.ts` again.
7. Export each repository file from `repository/index.ts` again.

## 3. May use

1. The ORM and its query helpers.
2. `drizzle-zod`, to derive an insert schema.
3. `better-auth`, to build the adapter that reads the authentication tables.
   This is the one exemption to
   [../../boundary-rules.md](../../boundary-rules.md) § 3.1. Build the adapter
   here, because the client never leaves this package.

## 4. Must not

1. Never write a query outside this package, except in a test file.
2. Never query a table that belongs to another repository, except when you use a JOIN operation.
3. Never let a repository use another repository.
4. Never let a caller give a database handle to a repository.

## 5. Schema

1. Let the ORM map the column to the configured database casing.
2. Ask the user to choose the primary key.
3. Give every table a created-at and an updated-at timestamp.
4. Cascade on delete for a required owner relation.
5. Derive the insert schema with `createInsertSchema()` when a caller validates
   an insert.
