// See https://github.com/jestjs/jest/blob/22029ba06b69716699254bb9397f2b3bc7b3cf3b/packages/pretty-format/src/plugins/ReactTestComponent.ts#L16-L29
export interface ReactTestObject {
  $$typeof: symbol | number;
  type: string;
  props?: Record<string, unknown>;
  children?: null | ReactTestChild[];
}

// Child can be `number` in Stack renderer but not in Fiber renderer.
export type ReactTestChild = ReactTestObject | string | number;

// This can be any kind of react component (class, functional, memo, forwardRef, fragment, etc.)
export type FilterListItem = any; // eslint-disable-line @typescript-eslint/no-explicit-any
export interface Filter {
  whitelist?: FilterListItem[];
  blacklist?: FilterListItem[];
}

export interface FiberOrInternalInstance {
  type: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  elementType?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  memoizedProps: Record<string, unknown>;
  child: FiberOrInternalInstance | null;
  sibling: FiberOrInternalInstance | null;
  return: FiberOrInternalInstance | null;
  _debugOwner: FiberOrInternalInstance;
}

export interface ChildrenFiberOrInternalInstance {
  props: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  type: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
