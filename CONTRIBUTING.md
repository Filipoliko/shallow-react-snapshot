# Contributing

PRs are welcome! Make sure, to add tests for your changes and run `npm test` before submitting a PR.

## Testing

We are using [jest](https://jestjs.io/) for testing. See [Jest CLI Options](https://jestjs.io/docs/cli) for more information.

To run all tests, use `npm test`. This will execute tests for all supported react versions.

To run tests only for a single react version, use `npm test -- --selectProjects react-16`.

## Codestyle

We are using [prettier](https://prettier.io/) for code formatting and eslint for static code analysis.

Run `npm run prettier` to format your code and `npm run eslint` to check for linting errors.
