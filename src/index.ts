import {
  ForwardRef,
  Memo,
  Fragment,
  Profiler,
  StrictMode,
  Suspense,
} from "react-is";
import {
  FiberOrInternalInstance,
  Filter,
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
  filter: Filter,
): ReactTestObject | string | null {
  validateFilter(filter);
  transformFilterToReactComponents(filter);

  if (rootElement === null) {
    return null;
  }

  const fiberOrInternalInstance = getFiberOrInternalInstance(rootElement);

  if (!fiberOrInternalInstance) {
    return null;
  }

  const rootReactComponent = getRootReactComponent(
    fiberOrInternalInstance,
    filter,
  );

  return renderReactComponentWithChildren(rootReactComponent, filter);
}

/**
 * Validates filter object to have either whitelist or blacklist
 */
function validateFilter(filter: Filter) {
  if (filter.whitelist && filter.blacklist) {
    throw new Error(
      "Shallow: You cannot use both whitelist and blacklist filters",
    );
  }

  if (!filter.whitelist && !filter.blacklist) {
    throw new Error(
      "Shallow: You must provide either whitelist or blacklist filter",
    );
  }

  if (filter.whitelist && !Array.isArray(filter.whitelist)) {
    throw new Error("Shallow: Whitelist filter must be an array");
  }

  if (filter.blacklist && !Array.isArray(filter.blacklist)) {
    throw new Error("Shallow: Blacklist filter must be an array");
  }
}

/**
 * Transforms React components in filter to their actual components
 * This is needed because React components are sometimes wrapped in React.memo or React.forwardRef
 */
function transformFilterToReactComponents(filter: Filter) {
  ["whitelist", "blacklist"].forEach((key) => {
    if (filter[key as keyof Filter]) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      filter[key as keyof Filter] = filter[key as keyof Filter]!.map(
        (component) => {
          if (Memo && component.$$typeof === Memo) {
            return component.type;
          }

          return component;
        },
      );
    }
  });
}

/**
 * Climb up the tree to find the root React component matching the filter
 */
function getRootReactComponent(
  fiberOrInternalInstance: FiberOrInternalInstance,
  filter: Filter,
): FiberOrInternalInstance {
  let current = fiberOrInternalInstance;

  // Find first component related to our filter
  if (!isComponentOwnerMatchingFilterRules(current, filter)) {
    while (
      current.return &&
      !isComponentOwnerMatchingFilterRules(current.return, filter)
    ) {
      current = current.return;
    }
  }

  while (
    current.return &&
    isComponentOwnerMatchingFilterRules(current.return, filter)
  ) {
    current = current.return;
  }

  if (!isComponentOwnerMatchingFilterRules(current, filter)) {
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
  reactComponent: FiberOrInternalInstance,
  filter: Filter,
): ReactTestObject | string {
  if (!reactComponent.type && !reactComponent.elementType) {
    // @TODO: We have a bug here, memoized props can be more complex than just a string
    return reactComponent.memoizedProps as unknown as string;
  }

  let children = null;

  // Check for React child elements
  if (reactComponent.child) {
    const childrenCandidate = renderReactComponentWithChildrenAndSiblings(
      reactComponent.child,
      filter,
    );

    // If there are some children, we render them
    if (childrenCandidate.length) {
      children = childrenCandidate;
    }
  }

  // If there are no children, we try to render children from props (if there are any)
  if (!children) {
    const childrenCandidate = getChildrenFromProps(reactComponent);

    if (childrenCandidate) {
      children = childrenCandidate;
    }
  }

  return {
    $$typeof: testSymbol,
    type: getType(reactComponent),
    props: getProps(reactComponent),
    children,
  };
}

/**
 * Checks if the owner of the component matches the filter rules
 */
function isComponentOwnerMatchingFilterRules(
  reactComponent: FiberOrInternalInstance,
  filter: Filter,
): boolean {
  if (!reactComponent._debugOwner) {
    return false;
  }

  if (filter.whitelist) {
    return filter.whitelist.includes(reactComponent._debugOwner.type);
  }

  if (filter.blacklist) {
    return !filter.blacklist.includes(reactComponent._debugOwner.type);
  }

  throw new Error(
    "Shallow: This should not happen. Please, report this issue.",
  );
}

/**
 * Recursively render React components with their children and siblings
 */
function renderReactComponentWithChildrenAndSiblings(
  reactComponent: FiberOrInternalInstance,
  filter: Filter,
): (ReactTestObject | string)[] {
  if (!isComponentOwnerMatchingFilterRules(reactComponent, filter)) {
    const children = [];

    if (reactComponent.child) {
      children.push(
        ...renderReactComponentWithChildrenAndSiblings(
          reactComponent.child,
          filter,
        ),
      );
    }

    if (reactComponent.sibling) {
      children.push(
        ...renderReactComponentWithChildrenAndSiblings(
          reactComponent.sibling,
          filter,
        ),
      );
    }

    return children;
  }

  const result: (ReactTestObject | string)[] = [
    renderReactComponentWithChildren(reactComponent, filter),
  ];

  let sibling = reactComponent.sibling;

  while (sibling) {
    result.push(renderReactComponentWithChildren(sibling, filter));
    sibling = sibling.sibling;
  }

  return result;
}

/**
 * Get type of the react component
 * Inspired by https://github.com/enzymejs/enzyme/blob/67b9ebeb3cc66ec1b3d43055c6463a595387fb14/packages/enzyme-adapter-react-16/src/ReactSixteenAdapter.js#L888
 */
function getType({ type, elementType }: FiberOrInternalInstance): string {
  type = elementType || type;

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
    return `ForwardRef(${getType({ type: type.render } as FiberOrInternalInstance)})`;
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
function getProps(node: FiberOrInternalInstance) {
  const type = node.type || node.elementType;

  return Object.entries(node.memoizedProps)
    .filter(([key, value]) => {
      // Skip children and undefined values
      if (key === "children" || value === undefined) {
        return false;
      }

      // Skip default props
      if (
        type.defaultProps &&
        key in type.defaultProps &&
        type.defaultProps[key] === value
      ) {
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
  node: FiberOrInternalInstance,
): (string | number | ReactTestObject)[] | null {
  const { children } = node.memoizedProps || {};

  if (!children) {
    return null;
  }

  if (typeof children === "string" || typeof children === "number") {
    return [children];
  }

  if (typeof children === "object") {
    if (
      Fragment &&
      (children as ChildrenFiberOrInternalInstance).type === Fragment
    ) {
      return [
        {
          $$typeof: testSymbol,
          type: "Fragment",
          props: {},
          children: (children as ChildrenFiberOrInternalInstance).props.children
            ? [(children as ChildrenFiberOrInternalInstance).props.children]
            : null,
        },
      ];
    }
  }

  throw new Error(
    "Shallow: Unable to get children from props. This should not happen. Please, report this issue.",
  );
}
