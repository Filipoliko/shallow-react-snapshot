// See https://github.com/facebook/react/blob/main/packages/shared/ReactSymbols.js
// Why not use `react-is`?
// The `react-is` library supports only one version of react. This helps
// us keep the library compatible with multiple versions of react.

export const Portal: symbol = Symbol.for("react.portal");
export const Fragment: symbol = Symbol.for("react.fragment");
export const StrictMode: symbol = Symbol.for("react.strict_mode");
export const Profiler: symbol = Symbol.for("react.profiler");
export const ForwardRef: symbol = Symbol.for("react.forward_ref");
export const Suspense: symbol = Symbol.for("react.suspense");
export const Memo: symbol = Symbol.for("react.memo");
// Context.Provider (React 16–18); in React 19 Provider uses react.context instead
export const ContextProvider: symbol = Symbol.for("react.provider");
// Context (React 19+) / Context.Consumer (React 16–18)
export const Context: symbol = Symbol.for("react.context");
// Context.Consumer (React 19+)
export const ContextConsumer: symbol = Symbol.for("react.consumer");
