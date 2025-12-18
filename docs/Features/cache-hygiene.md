# Feature: Cache Hygiene (Anti-Crash System)

Status: In Progress
Owner: Zendevve
Created: 2025-12-19
Links: [Phase 2 in task.md](../../task.md)

---

## Purpose

Prevent crashes and desync issues caused by stale WDB cache when switching between private servers. The WDB folder caches item/spell/NPC data that differs between servers, causing crashes or invisible items when switching.

---

## Scope

### In scope

- Clean WDB/Cache folders before game launch
- Per-server cache isolation (separate cache per profile)
- Toggle in Settings for automatic cache cleaning

### Out of scope

- Clean other game folders (Interface, WTF)

---

## Business Rules

1. WDB cleaning deletes: `Cache/`, `Cache/WDB/`, `WDB/` folders
2. Cache isolation renames cache folder to `Cache_{profileId}` before launch
3. Only clean/isolate when launching via the launcher (not manual exe launch)
4. Never delete user data (WTF, SavedVariables, Screenshots)
5. Cache cleaning happens BEFORE connection string injection

---

## User Flows

1. **Enable Cache Cleaning**
   - Actor: User
   - Trigger: Toggle "Clean Cache on Launch" in Settings
   - Result: Setting saved, cache deleted on next launch

2. **Launch with Cache Cleaning**
   - Actor: User
   - Trigger: Click Play with clean cache enabled
   - Result: Cache folders deleted, game launches clean

---

## Components

| File | Role |
|------|------|
| `electron/main.ts` | `clean-wdb-cache` IPC handler |
| `src/services/storage.ts` | Already has `getCleanWdb()` / `setCleanWdb()` |
| `src/components/RightSidebar.tsx` | Already calls `launchGame` with `cleanWdb` param |

---

## Verification

### Test commands

- build: `npm run build`
- test: `npm test`
- format: `npm run lint`

### Test flows

| ID | Description | Level | Expected result |
|----|-------------|-------|-----------------|
| POS-001 | Clean WDB folder exists | Unit | Folder deleted |
| POS-002 | Clean multiple cache paths | Unit | All paths deleted |
| NEG-001 | Cache folder doesn't exist | Unit | No error, graceful handling |

---

## Definition of Done

- [ ] `clean-wdb-cache` IPC handler implemented
- [ ] Handler called before launch when toggle enabled
- [ ] Cache isolation per server profile
- [ ] Unit tests for cache deletion
- [ ] Feature doc updated
