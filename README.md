# SimuWork

SimuWork is a Vite-powered React + TypeScript playground that showcases an AI-assisted tech stack simulator. The project uses Tailwind CSS for styling and Lucide icons for UI polish.

## Prerequisites

- Node.js 18 or newer
- npm (bundled with Node) or an alternative such as pnpm/yarn

## Getting Started

```bash
npm install
npm run dev
```

The dev server will start on [http://localhost:5173](http://localhost:5173). Use `npm run build` for production bundles and `npm run preview` to serve the built output locally.

## Project Structure

```
src/
  components/       # UI building blocks
  data/             # Static scenario + stack definitions
  hooks/            # Shared React hooks
  styles/           # Tailwind entrypoint
  types/            # Domain-specific TypeScript types
```

Tailwind configuration lives in `tailwind.config.ts`, while PostCSS is configured via `postcss.config.js`.


