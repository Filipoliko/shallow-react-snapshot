# shallow-react-snapshot

## 0.2.3

### Patch Changes

- 0043692: Updated build dependencies

## 0.2.2

### Patch Changes

- fbdcc8f: Provide more user-friendly error message if the second argument in `shallow` is missing.
- 319ea1f: Fix error when calling shallow on components, that are using `useEffect` and other React hooks. Resolves #9

## 0.2.1

### Patch Changes

- 54b8ef9: State updates in component are now propagated into the shallow results. Until now, it would propagateonly every other state update. This can change some test results, but it is a correction, so you should be able to just update your snapshot tests.

## 0.2.0

### Minor Changes

- 126ae9f: **Breaking Change!** Throw an error when unable to find React fiber or internal instance of the root component instead of just silently returning `null`. It seemed like an unrealistic scenario, but it can happen if there is no react component rendered into JSDOM. It is probably a user error, but it is better to inform the user about the issue than to let them wonder why the snapshot is empty.
- 126ae9f: Simplified the usage of shallow. **You can now write `shallow(container, MyComponent)` instead of `shallow(container.firstChild, MyComponent)`**. Both will still work, but it is always nice to write less code for the same value. This has been achieved by improving the internal logic of the shallow function to search also the children of the provided HTML element. This change should not break your tests, but some use-cases that were previously throwing an error might start working with this update.

### Patch Changes

- 56f913a: Fix bug when component contains multiple deeply nested arrays. Enzyme did flatten the arrays, but Shallow React Snapshot did not. This is now fixed.
- 126ae9f: RootReactComponent can be a string now! You can use `shallow(container, 'MyComponent')` and as long as the displayName, function name, or class name is matching, it will work. This might be more useful than it seems at first. Some implementations of HOC components extend your component instead of wrapping it. In this case the displayName might be the only way how to check the shallow representation of the component you actually want to test.
- 126ae9f: Reorganized some repeating type definitinos
- 126ae9f: More informative error message when unable to find RootReactComponent

## 0.1.7

### Patch Changes

- d209b5f: Cleanup published npm package to contain only runtime files

## 0.1.6

### Patch Changes

- 4c94623: React Shallow Snapshot is here! Now with changelogs, CI, automated release process and everything you would expect from a public node module.
