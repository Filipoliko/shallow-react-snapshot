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

```typescript
function shallow(rootElement: Element | null, RootReactComponent: ReactComponent | string): ReactTestChild | null
```

- `rootElement` - The root element of the rendered component. Typically `container` from `render` function of React Testing Library.
- `RootReactComponent` - Most likely the component you are testing. It can be a React component or its name as a string.
- Returns snapshot friendly shallow structure of the component.

**Example**

```javascript
import { shallow } from "shallow-react-snapshot";
import { render } from "@testing-library/react";

function MyComponent() {
  return (
    <MyNestedComponent data-testid="nested">
      <span>Text</span>
    </MyNestedComponent>
  );
}

function MyNestedComponent({ children, ...props }) {
  return <div {...props}>{children || null}</div>;
}

test("Render MyComponent", () => {
  const { container } = render(<MyComponent />);


  // Typical use-case
  expect(shallow(container, MyComponent)).toMatchSnapshot();
  // You can also use the string representation of the component to get the same result
  expect(shallow(container, "MyComponent")).toMatchSnapshot();

  // Result:
  // <MyNestedComponent
  //   data-testid="nested"
  // >
  //   <span>
  //     Text
  //   </span>
  // </MyNestedComponent>
});
```

### HOC Components

When you are testing components with higher-order components (HOC), you might run into some issues. The snapshot of the rendered component will contain the HOC component, which is probably not what you want to test. You want to test the original component without the HOC. With Enzyme shallow, this would not be possible, but with Shallow React Snapshot, you can easily achieve this.

```javascript
function withHOC(Component) {
  return function HOC(props) {
    return <Component {...props} />;
  };
}

test("Render MyComponentWithHOC", () => {
  const MyComponentWithHOC = withHOC(MyComponent);
  const { container } = render(<MyComponentWithHOC />);

  // This might not be what you want to test
  expect(shallow(container, MyComponentWithHOC)).toMatchSnapshot(); // Wrong!
  // Result:
  // <MyComponent />

  // You probably want to check the insides of the original component without HOC
  // You can either pass the original component into shallow
  expect(shallow(container, MyComponent)).toMatchSnapshot();
  // Or you can use the string representation of the component if you don't have the reference to the original component
  expect(shallow(container, "MyComponent")).toMatchSnapshot();

  // Result:
  // <MyNestedComponent
  //   data-testid="nested"
  // >
  //   <span>
  //     Text
  //   </span>
  // </MyNestedComponent>
});
```

## Contributing

If you want to contribute to this project, please read the [CONTRIBUTING.md](CONTRIBUTING.md) file.
