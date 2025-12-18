# Feature: Client Integrity Verification

Status: In Progress
Owner: Zendevve
Created: 2025-12-19

---

## Purpose

Verify WoW executable integrity to detect modifications, corruption, or trojans. Many private server clients come pre-modified, and users need assurance about executable safety.

---

## Scope

### In scope

- MD5 hash verification of Wow.exe
- Known-good hash database
- Status display in Settings

### Out of scope

- Automatic hash updates from remote
- DLL verification
- Memory scanning

---

## Business Rules

1. Hash comparison against known-hashes.json database
2. Unknown hash = "Unknown" status (not necessarily bad)
3. Known modified hash (e.g., LAA patched) = "Modified (Expected)"
4. Matching clean hash = "Verified Clean"
5. Never block game launch, only warn

---

## Components

| File | Role |
|------|------|
| `src/data/known-hashes.json` | Hash database |
| `electron/main.ts` | `verify-client-integrity` IPC handler |
| `src/pages/Settings.tsx` | Verify button and status display |

---

## Definition of Done

- [ ] known-hashes.json with hashes for each expansion
- [ ] verify-client-integrity IPC handler
- [ ] Settings UI "Verify Installation" button
- [ ] Status display with appropriate warning
