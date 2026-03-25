# testing-maps

A workspace mapping and visualization tool built with **Next.js** and **React Flow**. It is designed to be **local-first** and **zero-config**, using IndexedDB for persistence.

## Features

- **Local-First**: Your data stays in your browser. No database setup required.
- **Markdown Support**: Import/Export maps from/to Markdown.
- **Node-Based UI**: Visual organize testing scenarios with React Flow.
- **Dark Mode**: Premium glassmorphism aesthetic for all environments.
- **Testing Scenarios Map**: Comprehensive map of the app's own testing strategies.

## Tech Stack

- [Next.js 16](https://nextjs.org/) — App Router, SSR
- [React Flow (@xyflow/react)](https://reactflow.dev/) — Node-based graph visualization
- [idb-keyval](https://github.com/jakearchibald/idb-keyval) — IndexedDB-based key-value store for persistence
- [Framer Motion](https://www.framer.com/motion/) — Animations
- [Radix UI](https://www.radix-ui.com/) — Accessible component primitives
- [Tailwind CSS v4](https://tailwindcss.com/) — Styling

---

## Local Development

### 1. Prerequisites

- [Node.js 20+](https://nodejs.org/)

### 2. Clone & install

```bash
git clone <your-repo-url>
cd testing-maps
npm install
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Testing

This project maintains a high standard of quality with multiple testing layers.

### Automated Tests
```bash
# Unit tests (Vitest)
npm run test

# E2E tests (Playwright) — requires a running dev server
npm run test:e2e

# Playwright UI mode
npm run test:e2e:ui
```

### Testing Map
For a complete overview of all testing scenarios, instructions, and codebase links, see:
[**Testing Scenarios Map Example**](public/testing-scenarios-example.md)

---

## Git-Based Testing Map Workflow

Testing Maps bridges visual mind maps with your codebase through markdown files. The workflow:

1. **Create** your testing map visually in the workspace
2. **Export** using "Save to Project" — downloads a `*.testing-map.md` file with a standardized format
3. **Commit** the `.testing-map.md` file alongside your code
4. **AI tools** (like Claude Code) read the map via `CLAUDE.md` to understand testing context
5. **Teammates** import the file back into Testing Maps to visualize and update

### AI Integration

This repo includes a `CLAUDE.md` that references the testing map. AI coding assistants that support it will automatically:
- Check relevant test scenarios before making changes
- Update scenario statuses after fixing bugs
- Add new scenarios when implementing features

### File Convention

Files ending in `.testing-map.md` are recognized as testing map exports. They include a format header comment and can be re-imported into any Testing Maps workspace.

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get started.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
