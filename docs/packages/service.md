# Service

The service package owns the **units of work**.

A unit of work is boundary work that is dependent, transactional, or shared, as
§ 1.2 to § 1.4 define those three words. One boundary call that is none of the
three is not a unit of work, and the endpoint makes it directly.

## 1. Responsibility

1. Write a service function only for logic that is dependent, transactional, or shared.
2. Treat logic as dependent when one step always needs the result of another.
3. Treat logic as transactional when two writes must succeed together.
4. Treat logic as shared when two or more flows call it.
5. Perform a unit of work in service functions.
6. Write a guard function for each business check or domain rule, with one responsibility each.

## 2. Layout

1. Group the files by functionality, one folder each.
2. Name a service file `<function>Service.ts`.
3. Name a guard file `<function>Guards.ts`.
4. Export one object from every file, named after the file.
5. Keep the logger file, the log events at the root.
6. Keep the error file at the root.

## 3. May use

1. A boundary package, for every external system.
2. A transaction object of the database package, called by name.

## 4. Must not

1. Never call a service function from another service function.
2. Never put an independent, non-transactional, or unshared function here.
3. Never write a query, and never build a client or a connection.
4. Never get boundary functions or the database model from the request. Use your own import statements

## 5. Failure modes

1. If it is necessary, throw a business error.
2. Translate an error of a boundary package into an application error here.
