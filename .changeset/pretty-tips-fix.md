---
"shallow-react-snapshot": minor
---

Simplified the usage of shallow. **You can now write `shallow(container, MyComponent)` instead of `shallow(container.firstChild, MyComponent)`**. Both will still work, but it is always nice to write less code for the same value. This has been achieved by improving the internal logic of the shallow function to search also the children of the provided HTML element. This change should not break your tests, but some use-cases that were previously throwing an error might start working with this update.
