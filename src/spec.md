# Specification

## Summary
**Goal:** Complete a pre-publish QA pass to eliminate build-time and runtime errors and polish the app so it is ready to publish.

**Planned changes:**
- Fix any Motoko compilation errors so `dfx deploy` succeeds.
- Fix frontend production build TypeScript errors.
- Resolve runtime console errors across Discovery, Chat, and Games navigation/usage.
- Make chat/game ID derivation deterministic so principal order does not change the resulting ID.
- Correct chat history storage/append/read/clear logic to work with the chosen Motoko collection types (no invalid List mutation APIs).
- Fix incorrect async/mutation usage in the frontend (e.g., use `mutateAsync` when awaiting) and ensure disconnect/presence cleanup runs reliably.
- Prevent resource leaks in chat rendering (e.g., revoke inline-image object URLs when appropriate) and eliminate related warnings/errors.
- Remove unused empty placeholder frontend modules or replace with minimal safe stubs if referenced to avoid confusion/build issues.

**User-visible outcome:** The app deploys and builds cleanly, and users can move through Discovery, Chat, and Games without console errors; chats and games reliably map to the same IDs for the same two users, chat history behaves correctly, and chat UI is stable without leaks.
