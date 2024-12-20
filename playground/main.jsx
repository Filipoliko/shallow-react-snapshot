// @TODO: This is just a copy paste from src/__tests__/functional.test.tsx
// Lets load this dynamically
function MyComponent({ children, ...props }) {
  return (
    <div id="MyComponent" {...props}>
      {children || null}
    </div>
  );
}

function MyComponentWithChildrenOnSecondPosition({ children }) {
  return (
    <div id="MyComponentWithChildrenOnSecondPosition">
      <div>First</div>
      {children || null}
    </div>
  );
}

const MyMemoizedComponent = React.memo(MyComponent);
const MyForwardedComponent = React.forwardRef(function MyForwardedComponent(
  { children },
  ref,
) {
  return (
    <div id="MyForwardedComponent" ref={ref}>
      {children}
    </div>
  );
});

const testCases = [
  {
    description:
      "direct wrapper around react component with a single child element and children on second position",
    App: function App() {
      return (
        <MyComponentWithChildrenOnSecondPosition>
          <h1>Hello World One</h1>
        </MyComponentWithChildrenOnSecondPosition>
      );
    },
  },
];

testCases.forEach(({ App }, index) => {
  const root = document.createElement("div");
  root.id = `root-${index}`;
  document.body.appendChild(root);

  if (Number(React.version.split(".")[0]) >= 18) {
    ReactDOM.createRoot(root).render(<App />);
  } else {
    ReactDOM.render(<App />, root);
  }
});
