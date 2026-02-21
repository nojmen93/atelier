# Atelier — Custom Apparel Studio

A premium custom apparel website built with Next.js 14 and Sanity CMS.

## Architecture

```
atelier/
├── apps/
│   ├── web/          # Next.js 14 (App Router)
│   └── studio/       # Sanity Studio v3
└── packages/
    └── config/       # Shared configs (future)
```

## Prerequisites

- Node.js 18+
- pnpm 9+
- Sanity account (free tier works)

## Quick Start

### 1. Clone and Install

```bash
cd atelier
pnpm install
```

### 2. Create Sanity Project

```bash
# Login to Sanity
npx sanity login

# Create a new project (run from apps/studio)
cd apps/studio
npx sanity init --env

# This will create a .env file with your project ID
```

### 3. Configure Environment

Copy the env examples and fill in your values:

```bash
# Web app
cp apps/web/.env.example apps/web/.env.local

# Studio (should already exist from sanity init)
cp apps/studio/.env.example apps/studio/.env
```

Edit `apps/web/.env.local`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

### 4. Run Development

```bash
# Run both web and studio
pnpm dev

# Or separately:
pnpm dev:web    # http://localhost:3000
pnpm dev:studio # http://localhost:3333
```

### 5. Add Portfolio Content

1. Open Sanity Studio at `http://localhost:3333`
2. Create new Portfolio Projects
3. Upload images, set categories, adjust order
4. Content appears automatically on the website

## Deployment

### Vercel (Web)

```bash
cd apps/web
vercel
```

Environment variables needed:
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`

### Sanity Studio

```bash
cd apps/studio
npx sanity deploy
```

This deploys to `your-project.sanity.studio`

## Project Structure

### Web (`apps/web`)

| Path | Description |
|------|-------------|
| `app/page.tsx` | Main page component |
| `app/components/` | All UI components |
| `app/globals.css` | Full CSS (no Tailwind) |
| `lib/sanity.ts` | Sanity client + queries |

### Studio (`apps/studio`)

| Path | Description |
|------|-------------|
| `schemas/project.ts` | Portfolio project schema |
| `sanity.config.ts` | Studio configuration |

## Adding More Editable Content

To make services, process steps, or copy editable:

1. Create new schema in `apps/studio/schemas/`
2. Add to `schemas/index.ts`
3. Create query in `apps/web/lib/sanity.ts`
4. Fetch data in component

Example for services:

```ts
// apps/studio/schemas/service.ts
export default defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({ name: 'number', type: 'string' }),
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'description', type: 'text' }),
    defineField({ name: 'order', type: 'number' }),
  ],
})
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **CMS**: Sanity v3
- **Styling**: Vanilla CSS (custom properties)
- **Fonts**: Bebas Neue + Outfit (Google Fonts)
- **Monorepo**: pnpm + Turborepo
- **Deployment**: Vercel + Sanity Cloud

## License

Private — All rights reserved.
