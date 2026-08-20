# API

## 1. Responsibility

1. Keep one file for every endpoint, exporting one function named after it.
2. Declare the request interface and the response interface in that file.
3. Take an input that the app parsed already, and return the result.
4. Orchestrate the task stage by stage in that one function.

## 2. Layout

1. Group the endpoints by sub-domain, one folder each.
2. Export every endpoint function from the entry point.
3. Keep one stage helper, at the root, in `stage.ts`.

## 3. May use

1. A service function, for a one unit of work.
2. A guard function, for a business check.
3. A boundary package, for an external system.
4. The logger and the log events from [packages/service](../../packages/service) package.
5. The application error from [packages/service](../../packages/service) package.

## 4. Must not

1. Never call another endpoint function.
2. Never put a business rule here.
3. Never put a domain logic here.
4. Never perform a unit of work here.
5. Never wrap a guard function in a stage.
6. Never nest a stage.

## 5. The stage helper

1. Each call to a service function, or a boundary package function is a step.
2. Enclose each step in the stage helper.
3. Provide a stage name, a log event, and one function for each stage.
4. Change an exception at the boundary to an upstream error inside the stage.
5. Write a success log entry or a failure log entry inside the stage.
