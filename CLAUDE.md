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
- Always use shadcn/ui components when possible over alternatives
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

## UI Components
- Always use shadcn/ui components when building interfaces
- Customize shadcn/ui components instead of creating new ones
- Follow shadcn/ui patterns for forms, dialogs, and interactive elements
- When a needed component doesn't exist in shadcn/ui, create it following their style conventions
- Maintain consistent styling with the established design system

## External Services
- This app integrates with Supabase for authentication and data storage
- When implementation requires external configuration:
  1. Clearly explain what actions the user needs to take on third-party services
  2. Provide detailed, step-by-step instructions for configuring external services
  3. Ask the user to confirm when they've completed the external configuration
  4. Wait for explicit confirmation before proceeding with implementation
  5. If possible, provide code that validates the external configuration is working
- For Supabase specifically, always walk through provider setup steps sequentially