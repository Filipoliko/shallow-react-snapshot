---
"shallow-react-snapshot": patch
---

State updates in component are now propagated into the shallow results. Until now, it would propagateonly every other state update. This can change some test results, but it is a correction, so you should be able to just update your snapshot tests.
