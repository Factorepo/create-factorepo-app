# OpenSearch

Read [../../boundary-rules.md](../../boundary-rules.md) first.

## 1. Search templates

1. Do not create the query body in the code.
2. Save the query in a search template in the cluster. Call the template with its identifier.
3. Change the ranking in the template. Do not change the ranking in the code.
4. If you must change the template, get permission from the user.
5. Convert each response to a small exported type. Do not use the raw response.
