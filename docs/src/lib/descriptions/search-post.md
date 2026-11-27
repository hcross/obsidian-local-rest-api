Evaluates a provided query against each file in your vault.

This endpoint supports multiple query formats.  Your query should be specified in your request's body, and will be interpreted according to the `Content-type` header you specify from the below options. Additional query formats may be added in the future.

# JsonLogic (`application/vnd.olrapi.jsonlogic+json`)

Accepts a JsonLogic query specified as JSON.  See [JsonLogic](https://jsonlogic.com/operations.html)'s documentation for information about the base set of operators available, but in addition to those operators the following operators are available:

- `glob: [PATTERN, VALUE]`: Returns `true` if a string matches a glob pattern.  E.g.: `{"glob": ["*.foo", "bar.foo"]}` is `true` and `{"glob": ["*.bar", "bar.foo"]}` is `false`.
- `regexp: [PATTERN, VALUE]`: Returns `true` if a string matches a regular expression.  E.g.: `{"regexp": [".*\.foo", "bar.foo"]` is `true` and `{"regexp": [".*\.bar", "bar.foo"]}` is `false`. A pattern longer than 500 characters, or one rejected as potentially unsafe (catastrophic backtracking, "ReDoS"), fails the whole query with `400 InvalidFilterQuery` instead of being evaluated.

Returns only non-falsy results.  "Non-falsy" here treats the following values as "falsy":

- `false`
- `null` or `undefined`
- `0` (and `NaN`)
- `""`
- `[]`
- `{}`

This matters most for a query that selects a value rather than testing a condition. `{"var": "frontmatter.aliases"}` returns the notes whose `aliases` field has something in it; a note with `aliases: []` is left out exactly as a note with no `aliases` field at all is, so a file's absence from the results does not mean it lacks the field. To test whether a field is present, use JsonLogic's `missing` operator: `{"!": {"missing": ["frontmatter.aliases"]}}` matches every note that has the field, including those where it is `[]`, `false`, or `0`. Note that `missing` treats a field whose value is `""` or `null` (as from a frontmatter key left blank, like `aliases:`) as missing too.

Files are represented as an object having the schema described
in the Schema named 'NoteJson' at the bottom of this page.
Understanding the shape of a JSON object from a schema can be
tricky; so you may find it helpful to examine the generated metadata
for individual files in your vault to understand exactly what values
are returned.  To see that, access the `GET` `/vault/{filePath}`
route setting the header:
`Accept: application/vnd.olrapi.note+json`.  See examples below
for working examples of queries performing common search operations.

## Search limits

To keep one query from monopolising Obsidian, a JsonLogic search evaluates at most **500 Markdown files** and stops after **10 seconds**, whichever comes first. When either limit cuts the search short, the response is still `200` with the matches found so far, and carries the header `X-Obsidian-Search-Truncated: true`; a complete search omits the header. The limits are set by the environment of the Obsidian process: `OBSIDIAN_SEARCH_LIMIT` (files, default `500`) and `OBSIDIAN_QUERY_TIMEOUT_MS` (milliseconds, default `10000`). The same limits apply to the MCP `search_query` tool, which reports them as a `truncated` boolean beside `results`.
