# Testing Maps

A local-first tool for mapping testing scenarios as visual mind maps, powered by markdown.

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # Vitest unit tests
npm run test:e2e   # Playwright E2E (needs dev server running)
```

## Tech Stack

- Next.js 16 (App Router) + React Flow for node-based visualization
- IndexedDB (idb-keyval) for local persistence — no backend
- Tailwind CSS v4, Radix UI, Framer Motion

## Project Structure

- `src/app/` — Next.js pages (homepage, `/workspace`, `/guide`)
- `src/components/` — React components (canvas, modals, toolbar, nodes)
- `src/lib/` — Core logic: `markdown-parser.ts`, `markdown-generator.ts`, `types.ts`, `repository.ts`
- `src/__tests__/` — Vitest unit tests
- `e2e/` — Playwright E2E specs

## Testing Map Format

Maps are exported/imported as hierarchical markdown. The format:

```markdown
# Map Title

- **Scenario Label** [STATUS] (testType)
  - *Instructions:* What to do
  - *Expected:* What should happen
  - *Code:* `path/to/test-file.spec.ts`
  - *Priority:* critical | high | medium | low
  - *Risk:* high | medium | low
  - **Child Scenario** [UNTESTED] (manual)
    - *Instructions:* Nested scenario details
```

**STATUS values:** UNTESTED, VERIFIED, FAILED
**Test types:** manual, unit, integration, e2e

## Testing Map for This Project

The file `public/testing-scenarios-example.md` contains the comprehensive testing map for this app. When working on this codebase:

1. **Before implementing a feature** — check the testing map for relevant scenarios
2. **After fixing a bug** — update the related scenario status to VERIFIED and add the test file path in `*Code:*`
3. **When adding new functionality** — add corresponding test scenarios to the map
4. **When writing tests** — reference the scenario's instructions and expected results

## Conventions

- All data stays client-side (IndexedDB). No server endpoints or API calls.
- Markdown is the interchange format — it's how maps travel between the visual tool, git repos, and AI assistants.
- The parser (`markdown-parser.ts`) and generator (`markdown-generator.ts`) must maintain round-trip stability: parse → generate → parse should produce identical results.
- Files named `*.testing-map.md` follow the project convention for git-tracked testing maps.
