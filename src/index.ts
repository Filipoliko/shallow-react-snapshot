import { ForwardRef, Memo, Fragment, Profiler, StrictMode, Suspense } from 'react-is';

// See https://github.com/jestjs/jest/blob/22029ba06b69716699254bb9397f2b3bc7b3cf3b/packages/pretty-format/src/plugins/ReactTestComponent.ts#L16-L29
export type ReactTestObject = {
    $$typeof: symbol | number;
    type: string;
    props?: Record<string, unknown>;
    children?: null | Array<ReactTestChild>;
};

// Child can be `number` in Stack renderer but not in Fiber renderer.
type ReactTestChild = ReactTestObject | string | number;

const testSymbol =
  typeof Symbol === 'function' && Symbol.for
    ? Symbol.for('react.test.json')
    : 0xe_a7_13_57;

type Filter = {
    whitelist?: Array<any>;
    blacklist?: Array<any>;
}

/**
 * With react fiber we get this:
 * reactComponent.child -> dive in
 * reactComponent.sibling -> if there is multiple elements, it will point to the next one
 * reactComponent.return -> parent component
 * 
 * reactComponent._debugOwner -> owner component
 * 
 * A react component can have multiple elements, so multiple elements can point to the same react component.
 * A react component might not have any HTML element, but it still appears if we walk the dom tree via `child`/`sibling`/`return`.
 * 
 * reactComponent.type
 * -> string: native element
 * -> class: class component -> type.constructor.name
 * -> function: functional component -> type.displayName || type.name
 * 
 * reactComponent.memoizedProps -> props
 */

export function shallow(rootElement: HTMLElement, filter: Filter): ReactTestObject | string | null {
    validateFilter(filter);

    if (rootElement === null) {
        return null;
    }

    const fiberOrInternalInstance = getFiberOrInternalInstance(rootElement);

    if (!fiberOrInternalInstance) {
        return null;
    }

    const rootReactComponent = getRootReactComponent(fiberOrInternalInstance, filter);

    return renderReactComponentWithChildren(rootReactComponent, filter);
}

function validateFilter(filter: Filter) {
    if (filter.whitelist && filter.blacklist) {
        throw new Error('Shallow: You cannot use both whitelist and blacklist filters');
    }

    if (!filter.whitelist && !filter.blacklist) {
        throw new Error('Shallow: You must provide either whitelist or blacklist filter');
    }

    if (filter.whitelist && !Array.isArray(filter.whitelist)) {
        throw new Error('Shallow: Whitelist filter must be an array');
    }

    if (filter.blacklist && !Array.isArray(filter.blacklist)) {
        throw new Error('Shallow: Blacklist filter must be an array');
    }
}

function getRootReactComponent(fiberOrInternalInstance: any, filter: Filter): any {
    let current = fiberOrInternalInstance;

    while (current.return && isComponentOwnerMatchingFilterRules(current.return, filter)) {
        current = current.return;
    }

    return current;
}

function getFiberOrInternalInstance(element: HTMLElement): any {
    return Object.entries(element).find(([key]) => (
        key.startsWith('__reactFiber$') || // Functional component
        key.startsWith('__reactInternalInstance$') // Class component
    ))?.[1];
}

function renderReactComponentWithChildren(reactComponent: any, filter: Filter): ReactTestObject | string {
    if (!reactComponent.type && !reactComponent.elementType) {
        return reactComponent.memoizedProps as string;
    }

    let children = null;

    // Check for React child elements
    if (reactComponent.child) {
        const childrenCandidate = renderReactComponentWithChildrenAndSiblings(reactComponent.child, filter);

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

function isComponentOwnerMatchingFilterRules(reactComponent: any, filter: Filter): boolean {
    if (!reactComponent._debugOwner) {
        return false;
    }

    if (filter.whitelist) {
        return filter.whitelist.includes(reactComponent._debugOwner.type);
    }

    if (filter.blacklist) {
        return !filter.blacklist.includes(reactComponent._debugOwner.type);
    }

    throw new Error('Shallow: This should not happen. Please, report this issue.');
}

function renderReactComponentWithChildrenAndSiblings(reactComponent: any, filter: Filter): Array<ReactTestObject | string> {
    if (!isComponentOwnerMatchingFilterRules(reactComponent, filter)) {
        const children = [];

        if (reactComponent.child) {
            children.push(...renderReactComponentWithChildrenAndSiblings(reactComponent.child, filter));
        }

        if (reactComponent.sibling) {
            children.push(...renderReactComponentWithChildrenAndSiblings(reactComponent.sibling, filter));
        }

        return children;
    }

    const result: Array<ReactTestObject | string> = [renderReactComponentWithChildren(reactComponent, filter)];

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
function getType({ type, elementType }: any): string {
    type = type || elementType;

    // Native elements
    if (typeof type === 'string') {
        return type;
    }

    // Functional components
    if (typeof type === 'function') {
        return type.displayName || type.name;
    }

    // Class components
    if (type.prototype?.isReactComponent) {
        return type.constructor.name;
    }

    // React.memo
    if (type.$$typeof === Memo) {
        return `Memo(${getType(type)})`;
    }
    
    // React.forwardRef
    if (type.$$typeof === ForwardRef) {
        return `ForwardRef(${getType({ type: type.render })})`;
    }

    // React.Fragment
    if (type === Fragment) {
        return 'Fragment';
    }

    // React.Profiler
    if (type === Profiler) {
        return 'Profiler';
    }

    // React.StrictMode
    if (type === StrictMode) {
        return 'StrictMode';
    }

    // React.Suspense
    if (type === Suspense) {
        return 'Suspense';
    }

    // Unhandled type, this error hints that we need to add support for a new type
    throw new Error(`Unknown type ${type}`);
}

function getProps(node: any) {
    const type = node.type || node.elementType;

    return Object
        .entries(node.memoizedProps)
        .filter(([key, value]) => {
            // Skip children and undefined values
            if (key === 'children' || value === undefined) {
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
        .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {} as Record<string, unknown>);
}

function getChildrenFromProps(node: any): Array<string | number | ReactTestObject> | null {
    const { children } = node.memoizedProps || {};

    if (!children) {
        return null;
    }

    if (typeof children === 'string' || typeof children === 'number') {
        return [children];
    }

    if (typeof children === 'object') {
        if (children.type === Fragment) {
            return [{
                $$typeof: testSymbol,
                type: 'Fragment',
                props: {},
                children: children.props.children ? [children.props.children] : null,
            }];
        }
    }

    throw new Error('Shallow: Unable to get children from props. This should not happen. Please, report this issue.');
}
