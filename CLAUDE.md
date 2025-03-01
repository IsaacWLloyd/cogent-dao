# CLAUDE.md - Guidelines for Working with the Cogent DAO Codebase

## Build Commands
- `npm run dev` - Start development server with turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test -- -t "test name"` - Run a single test (when tests are added)
- `npm run typecheck` - Check TypeScript types (add to package.json scripts: `"typecheck": "tsc --noEmit"`)

## TypeScript & Styling
- Strict typing enabled with path alias: `@/src/*` maps to `./src/*`
- Components use newest React/Next.js patterns with App Router conventions
- Use CSS-in-JS with Tailwind (oklch color format) and themed variables
- Design system: Dark mode with grey colorscheme and orange highlights (hue 24) defined in globals.css
- Follow utility-first CSS approach with @apply where appropriate

## Code Conventions
- Use functional components with TypeScript and Readonly props
- Import order: React/Next.js core → external libraries → internal modules
- Prefer named exports over default exports
- File naming: kebab-case directories, PascalCase components
- Error handling: Leverage TypeScript's type system and React Error Boundaries
- Components should be small, focused, and follow the Single Responsibility Principle
- Follow semantic HTML patterns for accessibility
- Maintain responsive design principles throughout UI components