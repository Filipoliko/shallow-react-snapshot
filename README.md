# Shallow React Snapshot

[![CI](https://github.com/Filipoliko/shallow-react-snapshot/actions/workflows/test.yml/badge.svg)](https://github.com/Filipoliko/shallow-react-snapshot/actions/workflows/test.yml)
[![NPM Version](https://img.shields.io/npm/v/shallow-react-snapshot)](https://www.npmjs.com/package/shallow-react-snapshot)


Are you tired of the deep HTML structures in your React Testing Library snapshot tests? Do you want to see only the shallow structure of your components, just like with Enzyme shallow rendering? Shallow React Snapshot is here to help!

**What does this library do?**

It takes an already rendered HTML element and returns jest-friendly shallow JSON structure, which you can use in your snapshot tests. It helps you validate just the currently tested component and does not display the whole tree of nested components.

**What does this library NOT do?**

It does **NOT** render your components. It does **NOT** mock deeply nested React components. It does **NOT** replace React Testing Library, but it works well with it.

## Installation

Run following command to install Shallow React Snapshot.

```bash
npm install --save-dev shallow-react-snapshot
```

This library is tested with jest, JSDOM and React Testing Library, but it is not limited to these tools.

This library officially supports React 16 and newer.

## Usage

```javascript
import { shallow } from "shallow-react-snapshot";
import { render } from "@testing-library/react";

function MyComponent() {
  return (
    <div>
      <MyNestedComponent data-testid="nested">
        <span>Text</span>
      </MyNestedComponent>
    </div>
  );
}

function MyNestedComponent({ children, ...props }) {
  return (
    <div>
      <div>
        <div>
          <div {...props}>{children || null}</div>
        </div>
      </div>
    </div>
  );
}

test("Render", () => {
  const { container } = render(<MyComponent />);

  expect(shallow(container.firstChild, MyComponent)).toMatchSnapshot();
});
```

This results in following jest snapshot.

```
// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[`Render 1`] = `
<div>
  <MyNestedComponent
    data-testid="nested"
  >
    <span>
      Text
    </span>
  </MyNestedComponent>
</div>
`;
```

## Contributing

If you want to contribute to this project, please read the [CONTRIBUTING.md](CONTRIBUTING.md) file.
