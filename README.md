# Shallow React Snapshot

Are you tired of the deep HTML structures in your React Testing Library snapshot tests? Do you want to see only the shallow structure of your components, just like with Enzyme shallow rendering? Shallow React Snapshot is here to help!

**What does this library do?**

It takes an already rendered HTML element and returns jest-friendly shallow JSON structure, which you can use in your snapshot tests. It helps you validate just the currently tested component and does not display the whole tree of nested components.

**What does this library not do?**

It does **NOT** render your components. It does **NOT** mock deeply nested React components. It does **NOT** replace React Testing Library, but it works well with it.

## Installation

**Warning:** Shallow React Snapshot is in early development. Breaking changes may occur with minor version updates.

This library is tested with jest, JSDOM and React Testing Library, but it is not limited to these tools.

```bash
REACT_VERSION="<your-react-version>" npm install --save-dev shallow-react-snapshot react-is@$REACT_VERSION
```

SRS requires `react-is` to work properly. You need to install it manually and it should match the version of React you are using.

This library officially supports React 16 and newer.

## Usage

```javascript
import { shallow } from 'shallow-react-snapshot';
import { render } from '@testing-library/react';

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
                    <div {...props}>
                        {children || null}
                    </div>
                </div>
            </div>
        </div>
    );
}

test('Render', () => {
    const { container } = render(<MyComponent />);

    expect(shallow(container.firstChild, { whitelist: [MyComponent] })).toMatchSnapshot();
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
