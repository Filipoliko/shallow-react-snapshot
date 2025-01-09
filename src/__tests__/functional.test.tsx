import React from "react";
import { createPortal } from "react-dom";

import { render } from "@testing-library/react";

import { shallow } from "../index";

function MyComponent({
  children,
  ...props
}: {
  children?: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <div id="MyComponent" {...props}>
      {children || null}
    </div>
  );
}

function MyOtherComponent({
  children,
  ...props
}: {
  children?: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <div id="MyOtherComponent" {...props}>
      {children || null}
    </div>
  );
}

function WrapperAroundMyComponent({
  children,
  ...props
}: {
  children?: React.ReactNode;
  [key: string]: any;
}) {
  return <MyComponent {...props}>{children || null}</MyComponent>;
}

describe("Functional component render", () => {
  test("direct wrapper around react component with no child element", () => {
    function App() {
      return <MyComponent />;
    }
    const { container } = render(<App />);

    const result = shallow(container.firstChild as HTMLElement, App);

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

    const result = shallow(container.firstChild as HTMLElement, App);

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

    const result = shallow(container.firstChild as HTMLElement, App);

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

    const result = shallow(container.firstChild as HTMLElement, App);

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

    const result = shallow(container.firstChild as HTMLElement, App);

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

    const result = shallow(container.firstChild as HTMLElement, App);

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

    const result = shallow(container.firstChild as HTMLElement, App);

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

    const result = shallow(container.firstChild as HTMLElement, App);

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

    const result = shallow(container.firstChild as HTMLElement, App);

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

    const result = shallow(container.firstChild as HTMLElement, App);

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

    const result = shallow(container.firstChild as HTMLElement, App);

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

    const result = shallow(container.firstChild as HTMLElement, App);

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

    const result = shallow(container.firstChild as HTMLElement, App);

    expect(result).toMatchSnapshot();
  });

  test("wrapped in React.memo", () => {
    const App = React.memo(function App() {
      return <MyComponent>Hello World One</MyComponent>;
    });
    const { container } = render(<App />);

    const result = shallow(container.firstChild as HTMLElement, App);

    expect(result).toMatchSnapshot();
  });

  test("wrapped in React.forwardRef", () => {
    const App = React.forwardRef(function App() {
      return <MyComponent>Hello World One</MyComponent>;
    });
    const { container } = render(<App />);

    const result = shallow(container.firstChild as HTMLElement, App);

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

    const result = shallow(container.firstChild as HTMLElement, App);

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

    const result = shallow(container.firstChild as HTMLElement, App);

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

    const result = shallow(container.firstChild as HTMLElement, App);

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

    const result = shallow(container.firstChild as HTMLElement, App);

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

    const result = shallow(container.firstChild as HTMLElement, App);

    expect(result).toMatchSnapshot();
  });

  test("react component with another react component as a child", () => {
    const { container } = render(
      <WrapperAroundMyComponent>
        <MyComponent />
      </WrapperAroundMyComponent>,
    );

    const result = shallow(
      container.firstChild as HTMLElement,
      WrapperAroundMyComponent,
    );

    expect(result).toMatchSnapshot();
  });

  test("react component with another react component and native component as a child", () => {
    const { container } = render(
      <WrapperAroundMyComponent>
        <div />
        <MyComponent />
      </WrapperAroundMyComponent>,
    );

    const result = shallow(
      container.firstChild as HTMLElement,
      WrapperAroundMyComponent,
    );

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

    const result = shallow(
      container.firstChild as HTMLElement,
      WrapperAroundMyComponent,
    );

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

    const result = shallow(
      container.firstChild as HTMLElement,
      WrapperAroundMyComponent,
    );

    expect(result).toMatchSnapshot();
  });
});
