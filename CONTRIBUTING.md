# Contributing

PRs are welcome! Make sure, to add tests for your changes and run `npm test` before submitting a PR.

## Testing

We are using [jest](https://jestjs.io/) for testing. See [Jest CLI Options](https://jestjs.io/docs/cli) for more information.

To run all tests, use `npm test`. This will execute tests for all supported react versions.

To run tests only for a single react version, use `npm test -- --selectProjects react-16`.

## Codestyle

We are using [biome](https://biomejs.dev) for code formatting and linting.

Run `npm run lint` to check for formatting / linter issues in your code.

Run `npm run lint:fix` to fix formatting / linter issues in your code.

Run `npm run lint:fix:unsafe` to fix formatting / linter issues in your code including [unsafe fixes](https://biomejs.dev/linter/#unsafe-fixes).
