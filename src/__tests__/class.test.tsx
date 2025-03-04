import React, { Component } from "react";
import { createPortal } from "react-dom";

import { act, render } from "@testing-library/react";

import { shallow } from "../index";

interface MyComponentProps extends React.PropsWithChildren<{}> {
  something?: string;
}

interface MyComponentState {
  value: number;
}

class MyComponent extends Component<MyComponentProps> {
  render() {
    const { children, ...props } = this.props;
    return (
      <div id="MyComponent" {...props}>
        {children || null}
      </div>
    );
  }
}

class WrapperAroundMyComponent extends Component<React.PropsWithChildren<{}>> {
  render() {
    const { children, ...props } = this.props;
    return <MyComponent {...props}>{children || null}</MyComponent>;
  }
}

function withHOC<T>(Component: React.ComponentType<T>) {
  return function ComponentWithHOC(props: React.PropsWithChildren<T>) {
    return <Component {...props} />;
  };
}

describe("Class component render", () => {
  test("direct wrapper around react component with no child element", () => {
    class App extends Component {
      render() {
        return <MyComponent />;
      }
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("HOC component with shallow render of the wrapped component", () => {
    const MyComponentWithHOC = withHOC(MyComponent);
    const { container } = render(<MyComponentWithHOC />);

    const result = shallow(container, MyComponent);

    expect(result).toMatchSnapshot();
  });

  test("react component with string component argument", () => {
    class App extends Component {
      render() {
        return <MyComponent />;
      }
    }
    const { container } = render(<App />);

    const result = shallow(container, "App");

    expect(result).toMatchSnapshot();
  });

  test("direct wrapper around react component with a single child element", () => {
    class App extends Component {
      render() {
        return (
          <MyComponent>
            <h1>Hello World One</h1>
          </MyComponent>
        );
      }
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("direct wrapper around react component with a single child element and children on second position", () => {
    class MyComponentWithChildrenOnSecondPosition extends Component<
      React.PropsWithChildren<{}>
    > {
      render() {
        const { children } = this.props;
        return (
          <div id="MyComponentWithChildrenOnSecondPosition">
            <div>First</div>
            {children || null}
          </div>
        );
      }
    }

    class App extends Component {
      render() {
        return (
          <MyComponentWithChildrenOnSecondPosition>
            <h1>Hello World One</h1>
          </MyComponentWithChildrenOnSecondPosition>
        );
      }
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("direct wrapper around react component with a single child element and props", () => {
    class App extends Component {
      render() {
        return (
          <MyComponent something={"beautiful"}>
            <h1>Hello World One</h1>
          </MyComponent>
        );
      }
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("direct wrapper around react component with multiple deep child elements", () => {
    class App extends Component {
      render() {
        return (
          <MyComponent>
            <MyComponent>
              <h1>Hello World One</h1>
            </MyComponent>
          </MyComponent>
        );
      }
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("direct wrapper around react component that wraps another react component", () => {
    class App extends Component {
      render() {
        return (
          <WrapperAroundMyComponent>
            <h1>Hello World One</h1>
          </WrapperAroundMyComponent>
        );
      }
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("wrapper around react component with multiple children", () => {
    class App extends Component {
      render() {
        return (
          <div>
            <MyComponent>
              <h2>Hello World Two</h2>
              Some random text
            </MyComponent>
          </div>
        );
      }
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("wrapper around react component with single text child", () => {
    class App extends Component {
      render() {
        return (
          <div>
            <MyComponent>Some random text</MyComponent>
          </div>
        );
      }
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("wrapper around react component with single number child", () => {
    class App extends Component {
      render() {
        return (
          <div>
            <MyComponent>{1234}</MyComponent>
          </div>
        );
      }
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("fragment wrapper around react component with single text child", () => {
    class App extends Component {
      render() {
        return (
          <>
            <MyComponent>
              <>Some random text</>
            </MyComponent>
          </>
        );
      }
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("fragment wrapper around react component with multiple fragment children", () => {
    class App extends Component {
      render() {
        const neverTrue = false;

        return (
          <>
            <>
              <>
                <div />
                <div />
              </>
            </>
            <div />
            <MyComponent />
            {1234}
            {"Hello World"}
            {neverTrue && <div>I should not be rendered</div>}
          </>
        );
      }
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("direct memoized wrapper around react component with a single child element", () => {
    const MyMemoizedComponent = React.memo(MyComponent);
    class App extends Component {
      render() {
        return (
          <MyMemoizedComponent>
            <h1>Hello World One</h1>
          </MyMemoizedComponent>
        );
      }
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("wrapped in React.memo", () => {
    const App = React.memo(
      class App extends Component {
        render() {
          return <MyComponent>Hello World One</MyComponent>;
        }
      },
    );
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("direct profiler wrapper around react component with a single child element", () => {
    class App extends Component {
      render() {
        return (
          <React.Profiler id="profiler" onRender={() => {}}>
            <MyComponent>
              <h1>Hello World One</h1>
            </MyComponent>
          </React.Profiler>
        );
      }
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("direct StrictMode wrapper around react component with a single child element", () => {
    class App extends Component {
      render() {
        return (
          <React.StrictMode>
            <MyComponent>
              <h1>Hello World One</h1>
            </MyComponent>
          </React.StrictMode>
        );
      }
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("direct suspense wrapper around react component with a single child element", () => {
    class App extends Component {
      render() {
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <MyComponent>
              <h1>Hello World One</h1>
            </MyComponent>
          </React.Suspense>
        );
      }
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("react component with portal", () => {
    class App extends Component {
      render() {
        return (
          <MyComponent>
            {createPortal(<h1>Hello World One</h1>, document.body)}
          </MyComponent>
        );
      }
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("react component with another react component as a child", () => {
    const { container } = render(
      <WrapperAroundMyComponent>
        <MyComponent />
      </WrapperAroundMyComponent>,
    );

    const result = shallow(container, WrapperAroundMyComponent);

    expect(result).toMatchSnapshot();
  });

  test("react component with with another react component and native component as a child", () => {
    const { container } = render(
      <WrapperAroundMyComponent>
        <div />
        <MyComponent />
      </WrapperAroundMyComponent>,
    );

    const result = shallow(container, WrapperAroundMyComponent);

    expect(result).toMatchSnapshot();
  });

  test("react component with deeply nested multiple react components as a child", () => {
    const { container } = render(
      <WrapperAroundMyComponent>
        <WrapperAroundMyComponent>
          <WrapperAroundMyComponent>
            <MyComponent />
            <div />
            <MyComponent />
          </WrapperAroundMyComponent>
          <WrapperAroundMyComponent>
            <MyComponent />
            <div />
            <MyComponent />
          </WrapperAroundMyComponent>
        </WrapperAroundMyComponent>
      </WrapperAroundMyComponent>,
    );

    const result = shallow(container, WrapperAroundMyComponent);

    expect(result).toMatchSnapshot();
  });

  test("react component with array of children and component sibling", () => {
    class App extends Component {
      render() {
        return (
          <div>
            {[
              <div key={0} />,
              <div key={1} />,
              [<div key={2} />, [<div key={3} />]],
            ]}
            <div />
          </div>
        );
      }
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  // Do you wonder why there are 4 tests calling useState different amount of times?
  // This library is rendering everythign based on `memoizedProps`, which are not
  // always getting updated on the first react node we encounter. But it will get
  // updated second time, but not third time, and so on. I am not really sure when
  // it gets updated, so that's why we better test it.
  for (let n = 0; n < 4; n++) {
    test(`react component with state changed ${n} times`, async () => {
      let testSetState = (x: any) => x;
      class App extends Component<MyComponentProps, MyComponentState> {
        constructor(props: MyComponentProps) {
          super(props);

          this.state = { value: 0 };

          testSetState = this.setState.bind(this);
        }

        render() {
          return (
            <MyComponent data-testid={this.state.value}>
              <h1>Hello World One</h1>
            </MyComponent>
          );
        }
      }

      const { container, findByTestId } = render(<App />);

      for (let i = 0; i < n; i++) {
        const action = act(() => testSetState({ value: i + 1 }));

        if (Number(React.version.split(".")[0]) > 17) {
          await action;
        }

        await findByTestId(i + 1);
      }

      const result = shallow(container, App);

      expect(result).toMatchSnapshot();
    });
  }
});
