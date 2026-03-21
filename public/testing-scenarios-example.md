# Testing Maps - Complete Testing Map

This document tracks all testing scenarios for the Testing Maps application, including manual steps and links to automated test suites.

## Workspace Features

| Scenario | Instructions | Test Type | Automation Link |
| :--- | :--- | :--- | :--- |
| **Create New Map** | 1. Open Workspace<br>2. Click 'New Map' in Hero or Dropdown<br>3. Enter name and submit | **E2E** | [workspace-features.spec.ts](e2e/specs/workspace-features.spec.ts) |
| **Import Markdown** | 1. Open Dropdown > Import<br>2. Paste valid Markdown<br>3. Select 'Create' or 'Replace' | **E2E** | [workspace-import.spec.ts](e2e/specs/workspace-import.spec.ts) |
| **Import Edge Cases** | 1. Try empty content (should disable submit)<br>2. Deeply nested markdown (auto-parsing)<br>3. Special chars in labels | **E2E** | [workspace-import-edge-cases.spec.ts](e2e/specs/workspace-import-edge-cases.spec.ts) |
| **Switch Active Map** | 1. Open Map Dropdown<br>2. Click a different map from the list<br>3. Verify canvas updates | **E2E** | [workspace-features.spec.ts](e2e/specs/workspace-features.spec.ts) |
| **Auto-layout (LR/TB)** | 1. Load a map via toolbar<br>2. Toggle direction (vertical/horizontal)<br>3. Verify nodes rearrange | **Unit / E2E** | [layout.test.ts](src/__tests__/layout.test.ts) / [workspace-toolbar.spec.ts](e2e/specs/workspace-toolbar.spec.ts) |
| **Markdown Parsing** | N/A (Internal Logic) | **Unit** | [markdown-parser.test.ts](src/__tests__/markdown-parser.test.ts) |
| **Persistence Sanitization** | N/A (Internal Logic) | **Unit** | [repository.test.ts](src/__tests__/repository.test.ts) |

## Canvas Interactions

| Scenario | Instructions | Test Type | Automation Link |
| :--- | :--- | :--- | :--- |
| **Add Child Node** | 1. Select a node<br>2. Press `Tab` or click '+' in toolbar | **E2E** | [workspace-keyboard.spec.ts](e2e/specs/workspace-keyboard.spec.ts) |
| **Delete Node** | 1. Select a node<br>2. Press `Delete` or `Backspace` | **E2E** | [workspace-keyboard.spec.ts](e2e/specs/workspace-keyboard.spec.ts) |
| **Node Reparenting** | 1. Drag a node<br>2. Drop it on top of another node<br>3. Verify edge connection updates | **Manual** | - |
| **Edit Node Details** | 1. Double-click a node<br>2. Update label/status in sidebar<br>3. Verify canvas reflects changes | **Manual** | - |
| **Undo / Redo** | 1. Perform an action (e.g., add node)<br>2. Click 'Undo' / 'Redo' or use shortcuts<br>3. Verify state restores | **E2E (Visibility)** | [workspace-toolbar.spec.ts](e2e/specs/workspace-toolbar.spec.ts) |

## Global UI and Layout

| Scenario | Instructions | Test Type | Automation Link |
| :--- | :--- | :--- | :--- |
| **Dark Components** | 1. Toggle Dark Mode in User Menu<br>2. Verify 'Select a Map' island alignment<br>3. Verify high contrast in dropdown | **Manual** | - |
| **Keyboard Shortcuts List**| 1. Press `?` on a map<br>2. Verify modal pops up with shortcut list | **E2E** | [workspace-keyboard.spec.ts](e2e/specs/workspace-keyboard.spec.ts) |
| **Responsive Navigation**| 1. Shrink browser to mobile width<br>2. Check menu accessibility | **Manual** | - |
| **Landing Hero Sync** | 1. Check home page as guest<br>2. Check home page as logged user<br>3. Verify CTA text changes | **Manual** | - |

## Authentication (Simulated)

| Scenario | Instructions | Test Type | Automation Link |
| :--- | :--- | :--- | :--- |
| **Google Auth Flow** | 1. Click 'Sign In'<br>2. Complete Google popup<br>3. Check redirect to `/workspace` | **Manual** | - |
| **User Sign Out** | 1. Open User Menu (Settings icon)<br>2. Click 'Sign Out'<br>3. Check redirect to home | **Manual** | - |
| **Reset Password** | 1. Use forgot password link<br>2. Check email / `/auth/reset-password` | **Manual** | - |

---
> [!TIP]
> To run all automated tests, use `npm run test` for unit tests and `npm run test:e2e` for Playwright specs.
