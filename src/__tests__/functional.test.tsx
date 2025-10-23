import { act, render } from "@testing-library/react";
import React from "react";
import { createPortal } from "react-dom";

import { shallow } from "../index";

function MyComponent({
  children,
  ...props
}: React.PropsWithChildren<{ something?: string | number }>) {
  return (
    <div id="MyComponent" {...props}>
      {children || null}
    </div>
  );
}

function MyOtherComponent({ children, ...props }: React.PropsWithChildren<{}>) {
  return (
    <div id="MyOtherComponent" {...props}>
      {children || null}
    </div>
  );
}

function WrapperAroundMyComponent({
  children,
  ...props
}: React.PropsWithChildren<{}>) {
  return <MyComponent {...props}>{children || null}</MyComponent>;
}

function withHOC<T>(Component: React.ComponentType<T>) {
  return function ComponentWithHOC(props: React.PropsWithChildren<T>) {
    return <Component {...props} />;
  };
}

describe("Functional component render", () => {
  test("direct wrapper around react component with no child element", () => {
    function App() {
      return <MyComponent />;
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
    function App() {
      return <MyComponent />;
    }
    const { container } = render(<App />);

    const result = shallow(container, "App");

    expect(result).toMatchSnapshot();
  });

  test("react component with displayName and string component argument", () => {
    function App() {
      return <MyComponent />;
    }

    App.displayName = "AlternativeAppName";

    const { container } = render(<App />);

    const result = shallow(container, "AlternativeAppName");

    expect(result).toMatchSnapshot();
  });

  test("direct wrapper around components and more wrappers", () => {
    function App() {
      const txt = "txt";
      return (
        <WrapperAroundMyComponent>
          <div>
            <MyComponent>
              <span>Hello</span>
              <div>
                {txt}
                <MyComponent />
              </div>
            </MyComponent>
          </div>
        </WrapperAroundMyComponent>
      );
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("direct wrapper around react component with a single child element", () => {
    function App() {
      return (
        <MyComponent>
          <h1>Hello World One</h1>
        </MyComponent>
      );
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("direct wrapper around react component with a single child element and children on second position", () => {
    function MyComponentWithChildrenOnSecondPosition({
      children,
    }: {
      children: React.ReactNode;
    }) {
      return (
        <div id="MyComponentWithChildrenOnSecondPosition">
          <div>First</div>
          {children || null}
        </div>
      );
    }
    function App() {
      return (
        <MyComponentWithChildrenOnSecondPosition>
          <h1>Hello World One</h1>
        </MyComponentWithChildrenOnSecondPosition>
      );
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("direct wrapper around react component with a single child element and props", () => {
    function App() {
      return (
        <MyComponent something={"beautiful"}>
          <h1>Hello World One</h1>
        </MyComponent>
      );
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("direct wrapper around react component with multiple deep child elements", () => {
    function App() {
      return (
        <MyComponent>
          <MyComponent>
            <h1>Hello World One</h1>
          </MyComponent>
        </MyComponent>
      );
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("direct wrapper around react component that wraps another react component", () => {
    function App() {
      return (
        <WrapperAroundMyComponent>
          <h1>Hello World One</h1>
        </WrapperAroundMyComponent>
      );
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("wrapper around react component with multiple children", () => {
    function App() {
      return (
        <div>
          <MyComponent>
            <h2>Hello World Two</h2>
            Some random text
          </MyComponent>
        </div>
      );
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("wrapper around react component with single text child", () => {
    function App() {
      return (
        <div>
          <MyComponent>Some random text</MyComponent>
        </div>
      );
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("wrapper around react component with single number child", () => {
    function App() {
      return (
        <div>
          <MyComponent>{1234}</MyComponent>
        </div>
      );
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("fragment wrapper around react component with single text child", () => {
    function App() {
      return (
        <>
          <MyComponent>
            <>Some random text</>
          </MyComponent>
        </>
      );
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("fragment wrapper around react component with multiple children", () => {
    function App() {
      const neverTrue = false;

      return (
        <>
          <>
            <>
              <div />
              <MyComponent />
              {1234}
              {"Hello World"}
              {neverTrue && <div>I should not be rendered</div>}
            </>
          </>
        </>
      );
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("direct memoized wrapper around react component with a single child element", () => {
    const MyMemoizedComponent = React.memo(MyComponent);
    function App() {
      return (
        <MyMemoizedComponent>
          <h1>Hello World One</h1>
        </MyMemoizedComponent>
      );
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("wrapped in React.memo", () => {
    const App = React.memo(function App() {
      return <MyComponent>Hello World One</MyComponent>;
    });
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("wrapped in React.forwardRef", () => {
    const App = React.forwardRef(function App() {
      return <MyComponent>Hello World One</MyComponent>;
    });
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("direct forwarded wrapper around react component with a single child element", () => {
    const MyForwardedComponent = React.forwardRef(function MyForwardedComponent(
      { children }: { children: React.ReactNode },
      ref: React.Ref<HTMLDivElement>,
    ) {
      return (
        <div id="MyForwardedComponent" ref={ref}>
          {children}
        </div>
      );
    });
    function App() {
      return (
        <MyForwardedComponent>
          <h1>Hello World One</h1>
        </MyForwardedComponent>
      );
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("direct profiler wrapper around react component with a single child element", () => {
    function App() {
      return (
        <React.Profiler id="profiler" onRender={() => {}}>
          <MyComponent>
            <h1>Hello World One</h1>
          </MyComponent>
        </React.Profiler>
      );
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("direct StrictMode wrapper around react component with a single child element", () => {
    function App() {
      return (
        <React.StrictMode>
          <MyComponent>
            <h1>Hello World One</h1>
          </MyComponent>
        </React.StrictMode>
      );
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("direct suspense wrapper around react component with a single child element", () => {
    function App() {
      return (
        <React.Suspense fallback={<div>Loading...</div>}>
          <MyComponent>
            <h1>Hello World One</h1>
          </MyComponent>
        </React.Suspense>
      );
    }
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("react component with portal", () => {
    function App() {
      return (
        <MyComponent>
          {createPortal(<h1>Hello World One</h1>, document.body)}
        </MyComponent>
      );
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

  test("react component with another react component and native component as a child", () => {
    const { container } = render(
      <WrapperAroundMyComponent>
        <div />
        <MyComponent />
      </WrapperAroundMyComponent>,
    );

    const result = shallow(container, WrapperAroundMyComponent);

    expect(result).toMatchSnapshot();
  });

  test("react component with another whitelisted react component and native component as a child", () => {
    const { container } = render(
      <WrapperAroundMyComponent>
        <div />
        <MyComponent />
        <MyOtherComponent />
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
    function App() {
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
    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  // Do you wonder why there are 4 tests calling useState different amount of times?
  // This library is rendering everything based on `memoizedProps`, which are not
  // always getting updated on the first react node we encounter. But it will get
  // updated second time, but not third time, and so on. I am not really sure when
  // it gets updated, so that's why we better test it.
  for (let n = 0; n < 4; n++) {
    test(`react component with state changed ${n} times`, async () => {
      let testSetState = (x: any) => x;
      function App() {
        const [state, setState] = React.useState(0);
        testSetState = setState;
        return (
          <MyComponent data-testid={state}>
            <h1>Hello World One</h1>
          </MyComponent>
        );
      }

      const { container, findByTestId } = render(<App />);

      for (let i = 0; i < n; i++) {
        const action = act(() => testSetState(i + 1));

        if (Number(React.version.split(".")[0]) > 17) {
          await action;
        }

        await findByTestId(i + 1);
      }

      const result = shallow(container, App);

      expect(result).toMatchSnapshot();
    });

    // @FIXME: This test works only with React 19, but current test infrastructure does not let us test it
    // only in one version of React.
    // test(`react component with useActionState changed ${n} times`, async () => {
    //   let testSetActionState = () => {};
    //   function App() {
    //     const [state, setActionState] = React.useActionState(x => x + 1, 0);
    //     testSetActionState = setActionState;
    //     return (
    //       <MyComponent data-testid={state}>
    //         <h1>Hello World One</h1>
    //       </MyComponent>
    //     );
    //   }

    //   const { container, findByTestId } = render(<App />);

    //   for (let i = 0; i < n; i++) {
    //     const action = act(() => testSetActionState());

    //     if (Number(React.version.split(".")[0]) > 17) {
    //       await action;
    //     }

    //     await findByTestId(i + 1);
    //   }

    //   const result = shallow(container, App);

    //   expect(result).toMatchSnapshot();
    // });

    test(`react component with useReducer changed ${n} times`, async () => {
      const reducer = (_state: number, action: number) => action;
      let testSetReducerState = (x: any) => x;
      function App() {
        const [state, setReducerState] = React.useReducer(reducer, 0);
        testSetReducerState = setReducerState;
        return (
          <MyComponent data-testid={state}>
            <h1>Hello World One</h1>
          </MyComponent>
        );
      }

      const { container, findByTestId } = render(<App />);

      for (let i = 0; i < n; i++) {
        const action = act(() => testSetReducerState(i + 1));

        if (Number(React.version.split(".")[0]) > 17) {
          await action;
        }

        await findByTestId(i + 1);
      }

      const result = shallow(container, App);

      expect(result).toMatchSnapshot();
    });

    test(`react component with useEffect and state changed ${n} times`, async () => {
      let testSetState = (x: any) => x;
      function App() {
        const [state, setState] = React.useState(0);
        testSetState = setState;
        React.useEffect(() => {
          // Nothing to do here
        }, []);

        return (
          <MyComponent data-testid={state}>
            <h1>Hello World One</h1>
          </MyComponent>
        );
      }

      const { container, findByTestId } = render(<App />);

      for (let i = 0; i < n; i++) {
        const action = act(() => testSetState(i + 1));

        if (Number(React.version.split(".")[0]) > 17) {
          await action;
        }

        await findByTestId(i + 1);
      }

      const result = shallow(container, App);

      expect(result).toMatchSnapshot();
    });

    // @FIXME: This test works only with React 18+, but current test infrastructure does not let us test it
    // only in one version of React.
    // test(`react component with useTransition and state changed ${n} times`, async () => {
    //   let testSetState = (x: any) => x;
    //   function App() {
    //     const [isPending, startTransition] = React.useTransition();
    //     const [state, setState] = React.useState(0);
    //     testSetState = (x) => {
    //       startTransition(() => {
    //         setState(x);
    //       });
    //     };

    //     return (
    //       <MyComponent data-testid={state}>
    //         <h1>Hello World One</h1>
    //       </MyComponent>
    //     );
    //   }

    //   const { container, findByTestId } = render(<App />);

    //   for (let i = 0; i < n; i++) {
    //     const action = act(() => testSetState(i + 1));

    //     if (Number(React.version.split(".")[0]) > 17) {
    //       await action;
    //     }

    //     await findByTestId(i + 1);
    //   }

    //   const result = shallow(container, App);

    //   expect(result).toMatchSnapshot();
    // });
  }

  test("react component with useEffect", async () => {
    function App() {
      React.useEffect(() => {
        // Nothing to do here
      }, []);

      return (
        <MyComponent>
          <h1>Hello World One</h1>
        </MyComponent>
      );
    }

    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("react component with useCallback", async () => {
    function App() {
      React.useCallback(() => {
        // Nothing to do here
      }, []);

      return (
        <MyComponent>
          <h1>Hello World One</h1>
        </MyComponent>
      );
    }

    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("react component with useContext", async () => {
    const context = React.createContext({ textContent: "Hello World" });
    function App() {
      const { textContent } = React.useContext(context);

      return (
        <MyComponent>
          <h1>{textContent}</h1>
        </MyComponent>
      );
    }

    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("react component with useDebugValue", async () => {
    function App() {
      React.useDebugValue("Debugging value");

      return (
        <MyComponent>
          <h1>Hello World One</h1>
        </MyComponent>
      );
    }

    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  // @FIXME: This test works only with React 18+, but current test infrastructure does not let us test it
  // only in one version of React.
  // test(`react component with useDeferredValue`, async () => {
  //   function App() {
  //     const deferredQuery = React.useDeferredValue('Hello World', 'This text should not be rendered!');

  //     return (
  //       <MyComponent>
  //         <h1>{deferredQuery}</h1>
  //       </MyComponent>
  //     );
  //   }

  //   const { container } = render(<App />);

  //   const result = shallow(container, App);

  //   expect(result).toMatchSnapshot();
  // });

  // @FIXME: This test works only with React 18+, but current test infrastructure does not let us test it
  // only in one version of React.
  // test(`react component with useId`, async () => {
  //   function App() {
  //     const uid = React.useId();

  //     return (
  //       <MyComponent>
  //         <h1>Hello World {typeof uid}</h1>
  //       </MyComponent>
  //     );
  //   }

  //   const { container } = render(<App />);

  //   const result = shallow(container, App);

  //   expect(result).toMatchSnapshot();
  // });

  // @FIXME: This test works only with React 18+, but current test infrastructure does not let us test it
  // only in one version of React.
  // test(`react component with useInsertionEffect`, async () => {
  //   function App() {
  //     React.useInsertionEffect(() => {});

  //     return (
  //       <MyComponent>
  //         <h1>Hello World One</h1>
  //       </MyComponent>
  //     );
  //   }

  //   const { container } = render(<App />);

  //   const result = shallow(container, App);

  //   expect(result).toMatchSnapshot();
  // });

  test("react component with useLayoutEffect", async () => {
    function App() {
      React.useLayoutEffect(() => {});

      return (
        <MyComponent>
          <h1>Hello World One</h1>
        </MyComponent>
      );
    }

    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("react component with useMemo", async () => {
    function App() {
      const textContent = React.useMemo(() => "Hello World", []);

      return (
        <MyComponent>
          <h1>{textContent}</h1>
        </MyComponent>
      );
    }

    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });

  test("react component with useRef", async () => {
    function App() {
      React.useRef(0);

      return (
        <MyComponent>
          <h1>Hello World One</h1>
        </MyComponent>
      );
    }

    const { container } = render(<App />);

    const result = shallow(container, App);

    expect(result).toMatchSnapshot();
  });
});
