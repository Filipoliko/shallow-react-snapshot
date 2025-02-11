---
"shallow-react-snapshot": patch
---

Fix bug when component contains multiple deeply nested arrays. Enzyme did flatten the arrays, but Shallow React Snapshot did not. This is now fixed.
