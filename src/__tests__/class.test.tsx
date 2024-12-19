import React, { Component } from 'react';
import { createPortal } from 'react-dom';
import { shallow } from '../index';
import { render } from '@testing-library/react';

class MyComponent extends Component<{ children?: React.ReactNode, [key: string]: any }> {
    render() {
        const { children, ...props } = this.props;
        return <div id="MyComponent" {...props}>{children || null}</div>;
    }
}

class WrapperAroundMyComponent extends Component<{ children?: React.ReactNode, [key: string]: any }> {
  render() {
      const { children, ...props } = this.props;
      return <MyComponent {...props}>{children || null}</MyComponent>;
  }
}

class MyComponentWithChildrenOnSecondPosition extends Component<{ children?: React.ReactNode }> {
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

const MyMemoizedComponent = React.memo(MyComponent);

const testCases = [
  {
    description: 'direct wrapper around react component with no child element',
    App: class App extends Component {
      render() {
        return <MyComponent />;
      }
    },
  },
  {
    description: 'direct wrapper around react component with a single child element',
    App: class App extends Component {
      render() {
        return (
          <MyComponent>
            <h1>Hello World One</h1>
          </MyComponent>
        );
      }
    },
  },
  {
    description: 'direct wrapper around react component with a single child element and children on second position',
    App: class App extends Component {
      render() {
        return (
          <MyComponentWithChildrenOnSecondPosition>
            <h1>Hello World One</h1>
          </MyComponentWithChildrenOnSecondPosition>
        );
      }
    },
  },
  {
    description: 'direct wrapper around react component with a single child element and props',
    App: class App extends Component {
      render() {
        return (
          <MyComponent something={'beautiful'}>
            <h1>Hello World One</h1>
          </MyComponent>
        );
      }
    },
  },
  {
    description: 'direct wrapper around react component with multiple deep child elements',
    App: class App extends Component {
      render() {
        return (
          <MyComponent>
            <MyComponent>
              <h1>Hello World One</h1>
            </MyComponent>
          </MyComponent>
        );
      }
    },
  },
  {
    description: 'direct wrapper around react component that wraps another react component',
    App: class App extends Component {
      render() {
        return (
          <WrapperAroundMyComponent>
            <h1>Hello World One</h1>
          </WrapperAroundMyComponent>
        );
      }
    },
  },
  {
    description: 'wrapper around react component with multiple children',
    App: class App extends Component {
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
    },
  },
  {
    description: 'wrapper around react component with single text child',
    App: class App extends Component {
      render() {
        return (
          <div>
            <MyComponent>
              Some random text
            </MyComponent>
          </div>
        );
      }
    },
  },
  {
    description: 'wrapper around react component with single number child',
    App: class App extends Component {
      render() {
        return (
          <div>
            <MyComponent>
              {1234}
            </MyComponent>
          </div>
        );
      }
    },
  },
  {
    description: 'fragment wrapper around react component with single text child',
    App: class App extends Component {
      render() {
        return (
          <>
            <MyComponent>
              <>Some random text</>
            </MyComponent>
          </>
        );
      }
    },
  },
  {
    description: 'direct memoized wrapper around react component with a single child element',
    App: class App extends Component {
      render() {
        return (
          <MyMemoizedComponent>
            <h1>Hello World One</h1>
          </MyMemoizedComponent>
        );
      }
    },
  },
  {
    description: 'wrapped in React.memo',
    App: React.memo(class App extends Component {
      render() {
        return (
          <MyComponent>
            Hello World One
          </MyComponent>
        );
      }
    }),
  },
  {
    description: 'direct profiler wrapper around react component with a single child element',
    App: class App extends Component {
      render() {
        return (
          <React.Profiler id="profiler" onRender={() => {}}>
            <MyComponent>
              <h1>Hello World One</h1>
            </MyComponent>
          </React.Profiler>
        );
      }
    },
  },
  {
    description: 'direct StrictMode wrapper around react component with a single child element',
    App: class App extends Component {
      render() {
        return (
          <React.StrictMode>
            <MyComponent>
              <h1>Hello World One</h1>
            </MyComponent>
          </React.StrictMode>
        );
      }
    },
  },
// @TODO: Suspense is rendering a bit differently for React 16
//   {
//     description: 'direct suspense wrapper around react component with a single child element',
//     App: class App extends Component {
//       render() {
//         return (
//           <React.Suspense fallback={<div>Loading...</div>}>
//             <MyComponent>
//               <h1>Hello World One</h1>
//             </MyComponent>
//           </React.Suspense>
//         );
//       }
//     },
//   },
  {
    description: 'react component with portal',
    App: class App extends Component {
      render() {
        return (
          <MyComponent>
            {createPortal(<h1>Hello World One</h1>, document.body)}
          </MyComponent>
        );
      }
    },
  },
];
  
describe('Class component render', () => {
    test.each(testCases)('$description', ({ App }) => {
        const { container } = render(<App />);

        const result = shallow(container.firstChild as HTMLElement, { whitelist: [App] });

        expect(result).toMatchSnapshot();
    });
});
