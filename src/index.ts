import {
  ForwardRef,
  Fragment,
  Memo,
  Portal,
  Profiler,
  StrictMode,
  Suspense,
} from "./reactSymbols";
import type {
  ChildrenFiberOrInternalInstance,
  FiberOrInternalInstance,
  ReactComponent,
  ReactTestChild,
} from "./types";

const testSymbol =
  typeof Symbol === "function" && Symbol.for
    ? Symbol.for("react.test.json")
    : 0xe_a7_13_57;

/**
 * Transforms a HTML element into a shallow representation of a React component
 */
export function shallow(
  rootElement: Element | null,
  RootReactComponent: ReactComponent | string,
): ReactTestChild | null {
  if (rootElement === null) {
    return null;
  }

  const fiberOrInternalInstance =
    getFirstNestedFiberOrInternalInstance(rootElement);

  if (!fiberOrInternalInstance) {
    throw new Error(
      "Shallow: No React component found in the provided element, or its children. Are you sure there is a React component rendered?",
    );
  }

  let rootReactComponent = getFirstChildOfRootReactComponent(
    fiberOrInternalInstance,
    RootReactComponent,
  );

  // If the root component is using state, then the props that we are seeing might not be up-to-date
  if (rootReactComponent.return?.memoizedState) {
    const rootReactComponentCandidate = findCurrentlyRenderedState(
      rootReactComponent.return,
    ).child;

    if (!rootReactComponentCandidate) {
      throw new Error(
        "Shallow: Unable to find the currently rendered state. This should not happen. Please, report this issue.",
      );
    }

    rootReactComponent = rootReactComponentCandidate;
  }

  return renderReactComponentWithChildren(rootReactComponent);
}

/**
 * Search through alternate versions of current node to find the currently rendered state
 */
function findCurrentlyRenderedState(
  node: FiberOrInternalInstance,
  history: FiberOrInternalInstance[] = [],
): FiberOrInternalInstance {
  let current = node;

  const isLastRenderedState = isClassComponentState(current)
    ? isLastRenderedStateClassComponent
    : isLastRenderedStateFunctionalComponent;

  while (!isLastRenderedState(current)) {
    // There should always be an alternate component
    if (!current.alternate) {
      throw new Error(
        "Shallow: Unable to find the currently rendered state. There is no alternate component. This should not happen. Please, report this issue.",
      );
    }

    // This is here just to make sure we don't end up in an infinite loop
    if (history.includes(current)) {
      throw new Error(
        "Shallow: Unable to find the currently rendered state. There is a circular reference. This should not happen. Please, report this issue.",
      );
    }

    history.push(current);

    current = current.alternate;
  }

  return current;
}

/**
 * Checks if the node state definitions are specific for class components
 */
function isClassComponentState(node: FiberOrInternalInstance): boolean {
  return !node._debugHookTypes; // Debug hook types are available only in functional components
}

/**
 * Checks if the node state is the last rendered state (works for functional components)
 */
function isLastRenderedStateFunctionalComponent(
  node: FiberOrInternalInstance,
): boolean {
  // There is no queue, which means it is the last rendered state
  if (!node.memoizedState.queue) {
    return true;
  }

  return (
    node.memoizedState.memoizedState ===
    node.memoizedState.queue.lastRenderedState
  );
}

/**
 * Checks if the node state is the last rendered state (works for class components)
 */
function isLastRenderedStateClassComponent(
  node: FiberOrInternalInstance,
): boolean {
  // There is no queue, which means it is the last rendered state
  if (!node.updateQueue) {
    return true;
  }

  // React 16
  if (node.updateQueue.lastBaseUpdate === undefined) {
    return node.updateQueue.baseQueue === null;
  }

  // React 17+
  return node.updateQueue.lastBaseUpdate === null;
}

/**
 * Get first nested React Fiber or InternalInstance from a HTML element
 */
function getFirstNestedFiberOrInternalInstance(rootElement: Element) {
  let current = rootElement;
  let fiberOrInternalInstance = getFiberOrInternalInstance(current);

  // If the root element is not a React component, then we need to find the first child that is a React component
  while (!fiberOrInternalInstance && current.firstElementChild) {
    current = current.firstElementChild;
    fiberOrInternalInstance = getFiberOrInternalInstance(current);
  }

  return fiberOrInternalInstance;
}

/**
 * Transforms React components in filter to their actual components
 * This is needed because React components are sometimes wrapped in React.memo or React.forwardRef
 */
function transformRootReactComponent(
  RootReactComponent: ReactComponent,
): ReactComponent {
  if (typeof RootReactComponent === "string") {
    return RootReactComponent;
  }

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
  const componentStorage: string[] = [];
  const TransformedRootReactComponent =
    transformRootReactComponent(RootReactComponent);
  let current = fiberOrInternalInstance;

  // Find first component related to our filter
  // First we check in parent components
  while (
    current.return &&
    !isParentComponentMatching(
      current,
      TransformedRootReactComponent,
      componentStorage,
    )
  ) {
    current = current.return;
  }

  // If there is no matching parent component, then we need to check in children
  // If a child has a sibling, then it is a hint, that something is wrong and we abort
  // We could support search in siblings, but I cannot imagine a real-life scenario where it would be useful
  while (
    current.child &&
    !current.child.sibling &&
    !isParentComponentMatching(
      current,
      TransformedRootReactComponent,
      componentStorage,
    )
  ) {
    current = current.child;
  }

  // If we didn't find any matching component, then we throw an error
  if (!isParentComponentMatching(current, TransformedRootReactComponent)) {
    const componentsInfo =
      componentStorage.length > 0
        ? `Found components:\n  ${componentStorage.join("\n  ")}`
        : "No components found in the tree.";

    throw new Error(
      `Shallow: None of the rendered components matches the provided RootReactComponent "${getComponentDisplayName(RootReactComponent)}"\n\n${componentsInfo}`,
    );
  }

  return current;
}

/**
 * Get React Fiber or InternalInstance from a HTML element
 */
function getFiberOrInternalInstance(element: Element): FiberOrInternalInstance {
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
  reactComponent: FiberOrInternalInstance | string | number,
): ReactTestChild {
  if (typeof reactComponent !== "object") {
    return reactComponent;
  }

  const siblings = getReactComponentSiblings(reactComponent);

  // Only if the root component is wrapped in fragment, then there can be siblings
  if (siblings.length > 0) {
    return {
      $$typeof: testSymbol,
      type: "Fragment",
      props: {},
      children: [reactComponent, ...siblings]
        .map((child) => {
          return childrenReactComponentToTestObject(
            reactComponentToChildren(child),
          );
        })
        .filter(reactFalsyValuesFilter),
    };
  }

  return childrenReactComponentToTestObject(
    reactComponentToChildren(reactComponent),
  );
}

/**
 * Transform React component children into a ReactTestObject
 */
function childrenReactComponentToTestObject(
  childrenReactComponent: ChildrenFiberOrInternalInstance | string | number,
): ReactTestChild {
  if (typeof childrenReactComponent !== "object") {
    return childrenReactComponent;
  }

  return {
    $$typeof: testSymbol,
    type: getType(childrenReactComponent),
    props: getProps(childrenReactComponent),
    children: getChildrenFromProps(childrenReactComponent),
  };
}

/**
 * Get siblings of the react component
 */
function getReactComponentSiblings(
  reactComponent: FiberOrInternalInstance,
): FiberOrInternalInstance[] {
  const siblings = [];
  let current = reactComponent;

  while (current.sibling) {
    siblings.push(current.sibling);
    current = current.sibling;
  }

  return siblings;
}

/**
 * Transform React component into a ChildrenFiberOrInternalInstance
 */
function reactComponentToChildren(
  reactComponent: FiberOrInternalInstance | string | number,
): ChildrenFiberOrInternalInstance | string | number {
  if (typeof reactComponent !== "object") {
    return reactComponent;
  }

  if (
    reactComponent.memoizedProps &&
    typeof reactComponent.memoizedProps !== "object"
  ) {
    return reactComponent.memoizedProps;
  }

  // React.Fragment
  if (!reactComponent.elementType) {
    return {
      $$typeof: testSymbol,
      type: "Fragment",
      props: { children: reactComponent.memoizedProps },
    };
  }

  return {
    $$typeof: testSymbol,
    type: reactComponent.elementType,
    props: reactComponent.memoizedProps,
  };
}

/**
 * Check if parent of reactComponent is matching the Component
 */
function isParentComponentMatching(
  reactComponent: FiberOrInternalInstance,
  Component: ReactComponent,
  componentStorage?: string[],
): boolean {
  if (!reactComponent.return) {
    return false;
  }

  const { type } = reactComponent.return;

  // Not sure if this can happen, but since we are dealing with internal React structures,
  // it is better to be safe than sorry
  if (!type) {
    return false;
  }

  const displayName = getComponentDisplayName(type);

  // Store component names for debugging purposes and better error messages
  if (componentStorage && !componentStorage.includes(displayName)) {
    componentStorage.push(displayName);
  }

  if (typeof Component === "string") {
    return displayName === Component;
  }

  return type === Component;
}

/**
 * Get display name of the react component
 */
function getComponentDisplayName(type: ReactComponent): string {
  return typeof type === "string"
    ? type // native elements
    : type.displayName || type.name || type.constructor?.name; // functional components || class components
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
): ReactTestChild[] | null {
  const { children } = node.props || node;

  if (!children) {
    return null;
  }

  const arrayOfChildren = flattenNestedArrays(
    Array.isArray(children) ? children : [children],
  ) as ChildrenFiberOrInternalInstance[];

  return arrayOfChildren.filter(reactFalsyValuesFilter).map((child) => {
    // If child is any non-object value (number, string), return it as is
    if (typeof child !== "object") {
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

/**
 * Convert structures like `[<div />, <div />, [<div />, [<div />, <div />]]]` to `[<div />, <div />, <div />, <div />, <div />]`
 */
// biome-ignore lint/suspicious/noExplicitAny: We are very generic here, you can really pass anything
function flattenNestedArrays(array: any[]): any[] {
  return array.reduce((acc, value) => {
    if (Array.isArray(value)) {
      return acc.concat(flattenNestedArrays(value));
    }

    return acc.concat(value);
  }, []);
}

/**
 * Filter falsy values from React children
 */
// biome-ignore lint/suspicious/noExplicitAny: We are very generic here, you can really pass anything
function reactFalsyValuesFilter(value: any): boolean {
  return ![undefined, null, false].includes(value);
}
