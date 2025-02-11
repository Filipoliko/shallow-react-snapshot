# Contributing

PRs are welcome! Make sure, to add tests for your changes and run `npm test` before submitting a PR.

## Testing

We are using [jest](https://jestjs.io/) for testing. See [Jest CLI Options](https://jestjs.io/docs/cli) for more information.

To run all tests, use `npm test`. This will execute tests for all supported react versions.

To run tests only for a single react version, use `npm test -- --selectProjects react-16`.

## Link

You can link the package to your project by running `npm link && npm run dev` in the `shallow-react-snapshot` project and `npm link shallow-react-snapshot` in your project. The `npm run dev` will watch for changes in the `shallow-react-snapshot` project and rebuild the package.

## Playground

When investigating react internals, it is often helpful to have a playground to test things out and check them directly in the browser.

Run `npm run playground` to open a server with a simple react component (you will be able to select the version). You can edit the rendered react component in `playground/main.jsx` file if you want to simulate a specific scenario.

## Codestyle

We are using [biome](https://biomejs.dev) for code formatting and linting.

Run `npm run lint` to check for formatting / linter issues in your code.

Run `npm run lint:fix` to fix formatting / linter issues in your code.

Run `npm run lint:fix:unsafe` to fix formatting / linter issues in your code including [unsafe fixes](https://biomejs.dev/linter/#unsafe-fixes).
