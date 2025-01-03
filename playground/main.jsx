function MyComponent({ children, ...props }) {
  return (
    <div id="MyComponent" {...props}>
      {children || null}
    </div>
  );
}

function MyOtherComponent({ children, ...props }) {
  return (
    <div id="MyOtherComponent" {...props}>
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

function App() {
  return (
    <MyComponent>
      {ReactDOM.createPortal(<h1>Hello World One</h1>, document.body)}
    </MyComponent>
  );
}

const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);

if (Number(React.version.split(".")[0]) >= 18) {
  ReactDOM.createRoot(root).render(<App />);
} else {
  ReactDOM.render(<App />, root);
}
