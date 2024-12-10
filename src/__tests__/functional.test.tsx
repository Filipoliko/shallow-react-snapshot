import React from 'react';
import { createPortal } from 'react-dom';
import { shallow } from '../index';
import { render } from '@testing-library/react';

function MyComponent({ children, ...props }: { children?: React.ReactNode, [key: string]: any }) {
    return <div id="MyComponent" {...props}>{children || null}</div>;
}

function MyComponentWithChildrenOnSecondPosition({ children }: { children: React.ReactNode }) {
    return (
      <div id="MyComponentWithChildrenOnSecondPosition">
        <div>First</div>
        {children || null}
      </div>
    );
}
  
const MyMemoizedComponent = React.memo(MyComponent);
const MyForwardedComponent = React.forwardRef(function MyForwardedComponent({ children }: { children: React.ReactNode }, ref: React.Ref<HTMLDivElement>) {
    return <div id="MyForwardedComponent" ref={ref}>{children}</div>;
});

const testCases = [
  {
    description: 'direct wrapper around react component with no child element',
    App: function App() {
      return <MyComponent />;
    },
  },
  {
    description: 'direct wrapper around react component with a single child element',
    App: function App() {
      return (
        <MyComponent>
          <h1>Hello World One</h1>
        </MyComponent>
      );
    },
  },
  {
    description: 'direct wrapper around react component with a single child element and children on second position',
    App: function App() {
      return (
        <MyComponentWithChildrenOnSecondPosition>
          <h1>Hello World One</h1>
        </MyComponentWithChildrenOnSecondPosition>
      );
    },
  },
  {
    description: 'direct wrapper around react component with a single child element and props',
    App: function App() {
      return (
        <MyComponent something={'beautiful'}>
          <h1>Hello World One</h1>
        </MyComponent>
      );
    },
  },
  {
    description: 'direct wrapper around react component with multiple deep child elements',
    App: function App() {
      return (
        <MyComponent>
          <MyComponent>
            <h1>Hello World One</h1>
          </MyComponent>
        </MyComponent>
      );
    },
  },
  {
    description: 'wrapper around react component with multiple children',
    App: function App() {
      return (
        <div>
          <MyComponent>
            <h2>Hello World Two</h2>
            Some random text
          </MyComponent>
        </div>
      );
    },
  },
  {
    description: 'wrapper around react component with single text child',
    App: function App() {
      return (
        <div>
          <MyComponent>
            Some random text
          </MyComponent>
        </div>
      );
    },
  },
  {
    description: 'wrapper around react component with single number child',
    App: function App() {
      return (
        <div>
          <MyComponent>
            {1234}
          </MyComponent>
        </div>
      );
    },
  },
  {
    description: 'fragment wrapper around react component with single text child',
    App: function App() {
      return (
        <>
          <MyComponent>
            <>Some random text</>
          </MyComponent>
        </>
      );
    },
  },
  {
    description: 'direct memoized wrapper around react component with a single child element',
    App: function App() {
      return (
        <MyMemoizedComponent>
          <h1>Hello World One</h1>
        </MyMemoizedComponent>
      );
    },
  },
  {
    description: 'direct forwarded wrapper around react component with a single child element',
    App: function App() {
      return (
        <MyForwardedComponent>
          <h1>Hello World One</h1>
        </MyForwardedComponent>
      );
    },
  },
  {
    description: 'direct profiler wrapper around react component with a single child element',
    App: function App() {
      return (
        <React.Profiler id="profiler" onRender={() => {}}>
          <MyComponent>
            <h1>Hello World One</h1>
          </MyComponent>
        </React.Profiler>
      );
    },
  },
  {
    description: 'direct StrictMode wrapper around react component with a single child element',
    App: function App() {
      return (
        <React.StrictMode>
          <MyComponent>
            <h1>Hello World One</h1>
          </MyComponent>
        </React.StrictMode>
      );
    },
  },
// @TODO: Suspense is rendering a bit differently for React 16
//   {
//     description: 'direct suspense wrapper around react component with a single child element',
//     App: function App() {
//       return (
//         <React.Suspense fallback={<div>Loading...</div>}>
//           <MyComponent>
//             <h1>Hello World One</h1>
//           </MyComponent>
//         </React.Suspense>
//       );
//     },
//   },
  {
    description: 'react component with portal',
    App: function App() {
      return (
        <MyComponent>
          {createPortal(<h1>Hello World One</h1>, document.body)}
        </MyComponent>
      );
    },
  },
];

describe('Functional component render', () => {
    test.each(testCases)('$description', ({ App }) => {
        const { container } = render(<App />);

        const result = shallow(container.firstChild as HTMLElement, { whitelist: [App] });

        expect(result).toMatchSnapshot();
    });
});
