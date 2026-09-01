# Boundary Packages

## 1. Responsibility

1. Give the package one external system, and make it the only door to it.
2. Keep the package to the protocol of that system.
3. Each function must do only one task.

## 2. Layout

1. Create the minimum number of clients for the process.
2. Keep the clients internal, and do not export the clients
3. Export one object from a file, named after the file.
4. Obey the Replace Parameter with Explicit Methods rule.
5. Do not create functions that use enums, booleans, or flags.
6. Create a dedicated function for each parameter variant instead.
7. Keep a constant that only this package uses in a `constants` folder in this package. Keep a shared constant in [packages/constants](packages/constants.md).

## 3. May use

1. Its own SDK.
2. [packages/constants](../packages/constants).

## 4. Must not

1. Never put a business rule here.
2. Never put a domain logic here.
3. Never import the service package, the API package, or another boundary.
4. Never catch an exception, except when you try the operation again, or when the external system reports that an item is absent.
5. Never write a function that does more than one action.
6. Never return a null value or an empty value when an operation fails. Throw an exception instead.
7. Return a null value when the external system reports that an item is absent.
