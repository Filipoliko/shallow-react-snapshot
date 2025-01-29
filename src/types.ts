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
// biome-ignore lint/suspicious/noExplicitAny: No typing available from 3rd party library
export type ReactComponent = any;

export interface FiberOrInternalInstance {
  // biome-ignore lint/suspicious/noExplicitAny: No typing available from 3rd party library
  type: any;
  // biome-ignore lint/suspicious/noExplicitAny: No typing available from 3rd party library
  elementType?: any;
  memoizedProps: Record<string, unknown>;
  child: FiberOrInternalInstance | null;
  sibling: FiberOrInternalInstance | null;
  return: FiberOrInternalInstance | null;
  _debugOwner: FiberOrInternalInstance;
}

export interface ChildrenFiberOrInternalInstance {
  $$typeof: symbol | number;
  children?: ReactTestChild[];
  // biome-ignore lint/suspicious/noExplicitAny: No typing available from 3rd party library
  props?: any;
  // biome-ignore lint/suspicious/noExplicitAny: No typing available from 3rd party library
  type?: any;
}
