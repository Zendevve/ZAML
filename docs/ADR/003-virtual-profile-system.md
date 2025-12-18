# ADR-003: Virtual Profile System for Multi-Server Connection

Status: Accepted
Date: 2025-12-19
Owner: Zendevve
Related Features: [virtual-profile-system.md](../Features/virtual-profile-system.md)
Supersedes: N/A
Superseded by: N/A

---

## Context

Private WoW server players often use multiple servers across different expansions (Vanilla, TBC, WotLK, etc.). Each server requires a different connection string in realmlist.wtf or Config.wtf. Currently, users must manually edit these files every time they switch servers, which is:

- Error-prone (typos, wrong file location)
- Time-consuming
- Confusing for different expansion versions (realmlist vs Config.wtf)

A unified system is needed to abstract this complexity and allow one-click server switching.

---

## Decision

Implement a Virtual Profile System that:

1. Stores server profiles in localStorage (zero backend cost)
2. Detects the correct connection file based on expansion type
3. Injects connection strings before game launch
4. Handles expansion-specific differences transparently

Key points:

- Vanilla/TBC/WotLK/Cata: Use `realmlist.wtf` in `Data/{Locale}/` folders
- Vanilla: Also write to root `realmlist.wtf`
- MoP (5.4.8)+: Use `SET portal` in `WTF/Config.wtf`
- Detection and injection happen in Electron main process via IPC

---

## Alternatives considered

### Option A: Separate realmlist files per server

- Pros: No file modification needed, swap whole file
- Cons: User must manage multiple files, doesn't work for Config.wtf
- Rejected because: More complex for user, doesn't handle MoP

### Option B: Symbolic links to different realmlist files

- Pros: Clean, no parsing needed
- Cons: Symlinks require admin on Windows, confusing for users
- Rejected because: Poor UX, Windows UAC issues

### Option C: Parse and inject (Selected)

- Pros: Works for all expansion types, transparent to user
- Cons: Must handle parsing edge cases
- Selected because: Best UX, handles all expansion variations

---

## Consequences

### Positive

- Users can switch servers with one click
- Supports all expansion types (1.12 through 5.4.8)
- No external dependencies or backend costs
- Works with existing launcher infrastructure

### Negative / risks

- File write permissions may fail in Program Files
- Mitigation: Show clear error with "Run as admin" suggestion

- Parsing edge cases may break injection
- Mitigation: Comprehensive unit tests for parsing logic

---

## Impact

### Code

- Affected modules: `electron/main.ts`, `src/services/electron.ts`, `src/services/storage.ts`
- New types: `ServerProfile`, `ConnectionFileInfo`, `PatcherInfo`
- New utilities: `parseRealmlist`, `injectRealmlist`, `parseConfigWtf`, `injectConfigWtf`

### Data / configuration

- Data model: ServerProfile stored in localStorage under `zen-server-profiles`
- Backwards compatibility: New feature, no migration needed

### Documentation

- Feature docs: `docs/Features/virtual-profile-system.md`
- Testing docs: Updated test flows
- AGENTS.md: No changes needed

---

## Verification

### Test commands

- build: `npm run build`
- test: `npm test`
- format: `npm run lint`

### New or changed tests

| ID | Scenario | Level | Expected result |
|----|----------|-------|-----------------|
| TST-001 | Parse realmlist with various formats | Unit | Correct address extraction |
| TST-002 | Inject into existing realmlist | Unit | Address replaced |
| TST-003 | Parse Config.wtf key-value pairs | Unit | Correct parsing |
| TST-004 | Inject portal into Config.wtf | Unit | Portal updated |
| TST-005 | Locale folder validation | Unit | Correct validation |

### Regression and analysis

- Regression suites: `npm test` (all 43 tests must pass)
- Static analysis: `npm run lint` (0 errors)

---

## Rollout and migration

- Migration steps: None (new feature)
- Backwards compatibility: N/A
- Rollback: Remove IPC handlers, feature is isolated

---

## References

- Issues: N/A
- External docs: WoW private server wiki on realmlist formats
- Related ADRs: ADR-001 (Electron Architecture), ADR-002 (IPC Bridge Pattern)

---

## Filing checklist

- [x] File saved under `docs/ADR/003-virtual-profile-system.md`
- [x] Status reflects real state (Accepted)
- [x] Links to related features filled in
