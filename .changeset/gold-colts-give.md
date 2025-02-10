---
"shallow-react-snapshot": minor
---

**Breaking Change!** Throw an error when unable to find React fiber or internal instance of the root component instead of just silently returning `null`. It seemed like an unrealistic scenario, but it can happen if there is no react component rendered into JSDOM. It is probably a user error, but it is better to inform the user about the issue than to let them wonder why the snapshot is empty.
