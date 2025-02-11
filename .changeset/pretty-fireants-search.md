---
"shallow-react-snapshot": patch
---

RootReactComponent can be a string now! You can use `shallow(container, 'MyComponent')` and as long as the displayName, function name, or class name is matching, it will work. This might be more useful than it seems at first. Some implementations of HOC components extend your component instead of wrapping it. In this case the displayName might be the only way how to check the shallow representation of the component you actually want to test.
