import {
  ForwardRef,
  Memo,
  Fragment,
  Portal,
  Profiler,
  StrictMode,
  Suspense,
} from "react-is";
import {
  FiberOrInternalInstance,
  ReactComponent,
  ReactTestObject,
  ChildrenFiberOrInternalInstance,
} from "./types";

const testSymbol =
  typeof Symbol === "function" && Symbol.for
    ? Symbol.for("react.test.json")
    : 0xe_a7_13_57;

/**
 * Transforms a HTML element into a shallow representation of a React component
 */
export function shallow(
  rootElement: HTMLElement | null,
  RootReactComponent: ReactComponent,
): ReactTestObject | string | null {
  if (rootElement === null) {
    return null;
  }

  const fiberOrInternalInstance = getFiberOrInternalInstance(rootElement);

  if (!fiberOrInternalInstance) {
    return null;
  }

  const rootReactComponent = getFirstChildOfRootReactComponent(
    fiberOrInternalInstance,
    RootReactComponent,
  );

  return renderReactComponentWithChildren(rootReactComponent);
}

/**
 * Transforms React components in filter to their actual components
 * This is needed because React components are sometimes wrapped in React.memo or React.forwardRef
 */
function transformRootReactComponent(
  RootReactComponent: ReactComponent,
): ReactComponent {
  if (Memo && RootReactComponent.$$typeof === Memo) {
    return RootReactComponent.type;
  }

  return RootReactComponent;
}

/**
 * Climb up the tree to find the root React component matching the filter
 */
function getFirstChildOfRootReactComponent(
  fiberOrInternalInstance: FiberOrInternalInstance,
  RootReactComponent: ReactComponent,
): FiberOrInternalInstance {
  const TransformedRootReactComponent =
    transformRootReactComponent(RootReactComponent);
  let current = fiberOrInternalInstance;

  // Find first component related to our filter
  while (
    current.return &&
    !isParentComponentMatching(current, TransformedRootReactComponent)
  ) {
    current = current.return;
  }

  if (!isParentComponentMatching(current, TransformedRootReactComponent)) {
    throw new Error(
      "Shallow: Unable to find root component. This should not happen. Please, report this issue.",
    );
  }

  return current;
}

/**
 * Get React Fiber or InternalInstance from a HTML element
 */
function getFiberOrInternalInstance(
  element: HTMLElement,
): FiberOrInternalInstance {
  return Object.entries(element).find(
    ([key]) =>
      key.startsWith("__reactFiber$") || // Functional component
      key.startsWith("__reactInternalInstance$"), // Class component
  )?.[1];
}

/**
 * Transform React component into a JSON representation
 */
function renderReactComponentWithChildren(
  reactComponent: FiberOrInternalInstance | string,
): ReactTestObject | string {
  if (typeof reactComponent === "string") {
    return reactComponent;
  }

  const childrenReactComponent: ChildrenFiberOrInternalInstance = {
    $$typeof: testSymbol,
    type: reactComponent.elementType,
    props: reactComponent.memoizedProps,
  };

  return {
    $$typeof: testSymbol,
    type: getType(childrenReactComponent),
    props: getProps(childrenReactComponent),
    children: getChildrenFromProps(childrenReactComponent),
  };
}

/**
 * Check if parent of reactComponent is matching the Component
 */
function isParentComponentMatching(
  reactComponent: FiberOrInternalInstance,
  Component: ReactComponent,
): boolean {
  if (!reactComponent.return) {
    return false;
  }

  return reactComponent.return.type === Component;
}

/**
 * Get type of the react component
 * Inspired by https://github.com/enzymejs/enzyme/blob/67b9ebeb3cc66ec1b3d43055c6463a595387fb14/packages/enzyme-adapter-react-16/src/ReactSixteenAdapter.js#L888
 */
function getType(instance: ChildrenFiberOrInternalInstance): string {
  const { type, $$typeof } = instance;

  if (Portal && $$typeof && $$typeof === Portal) {
    return "Portal";
  }

  if (!type) {
    console.log(instance);
    throw new Error(
      "Shallow: Unable to get type of the component. This should not happen. Please, report this issue.",
    );
  }

  // Native elements
  if (typeof type === "string") {
    return type;
  }

  // Functional components
  if (typeof type === "function") {
    return type.displayName || type.name;
  }

  // Class components
  if (type.prototype?.isReactComponent) {
    return type.constructor.name;
  }

  // React.memo
  if (Memo && type.$$typeof === Memo) {
    return `Memo(${getType(type)})`;
  }

  // React.forwardRef
  if (ForwardRef && type.$$typeof === ForwardRef) {
    return `ForwardRef(${getType({ type: type.render } as ChildrenFiberOrInternalInstance)})`;
  }

  // React.Fragment
  if (Fragment && type === Fragment) {
    return "Fragment";
  }

  // React.Profiler
  if (Profiler && type === Profiler) {
    return "Profiler";
  }

  // React.StrictMode
  if (StrictMode && type === StrictMode) {
    return "StrictMode";
  }

  // React.Suspense
  if (Suspense && type === Suspense) {
    return "Suspense";
  }

  // Unhandled type, this error hints that we need to add support for a new type
  throw new Error(`Unknown type ${type}`);
}

/**
 * Get props of the react component
 */
function getProps(
  node: ChildrenFiberOrInternalInstance,
): Record<string, unknown> {
  const { props = {} } = node;

  return Object.entries(props)
    .filter(([key, value]) => {
      // Skip children and undefined values
      if (key === "children" || value === undefined) {
        return false;
      }

      return true;
    })
    .reduce(
      (acc, [key, value]) => {
        acc[key] = value;
        return acc;
      },
      {} as Record<string, unknown>,
    );
}

/**
 * Get children from props
 */
function getChildrenFromProps(
  node: ChildrenFiberOrInternalInstance,
): (string | number | ReactTestObject)[] | null {
  const { children } = node.props || (node.children && node) || {};

  if (!children) {
    return null;
  }

  const arrayOfChildren = Array.isArray(children) ? children : [children];

  return arrayOfChildren.map((child) => {
    // If child is any non-object value (number, string, boolean, ...), or null, return it as is
    if (typeof child !== "object" || child === null) {
      return child;
    }

    return {
      $$typeof: testSymbol,
      type: getType(child),
      props: getProps(child),
      children: getChildrenFromProps(child),
    };
  });
}
