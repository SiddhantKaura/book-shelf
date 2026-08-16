# Next.js Learning Plan — Project: BookShelf

## Goal
Learn Next.js hands-on (already comfortable with React) by building one realistic,
portfolio-worthy project end to end, designed from the start to be extended with a
real backend later.

## Learning Style
- Explain concept → relate to React → apply to the project → give me a task →
  I implement → review → hints before solutions → full solution only if I ask.
- One evolving project, not disconnected mini-projects.
- Maintain a running Next.js cheat sheet throughout; full version delivered at the end.

## Chosen Project: BookShelf
A Goodreads-style reading tracker.
- Search books via a public API (Open Library or Google Books)
- Personal shelf: want-to-read / reading / finished
- Ratings & reviews
- Book & author detail pages

**Why this project:** widest natural coverage of Next.js concepts — SEO/SSG/ISR on
public book pages, a private client-heavy dashboard for the personal shelf, search via
`searchParams`, and a clean path to bolt on a real backend later (auth, DB, social,
file uploads). Chosen over JobBoard, PlateUp (recipes/meal planner), and PulseBoard
(finance dashboard).

**Future idea (flagged, not started yet):** AI-powered "good read finder" —
recommend books based on the user's shelf/ratings (LLM-prompt-based suggestions or
embeddings-based similarity), once backend + AI integration are in place.

## Roadmap

### Phase 0 — Mental Model (discussion, no code)
- What Next.js is and why it exists; problems it solves that plain React (CRA/Vite SPA) doesn't
- React vs Next.js: rendering models (CSR vs SSR/SSG/ISR), routing, data fetching, bundling
- When to actually choose Next.js vs a plain React app
- `create-next-app` walkthrough, project structure, App Router mental model

### Phase 1 — Routing & Layouts
- File-based routing, `page.tsx`, dynamic routes (`/books/[id]`)
- Root layout + nested layouts (public site chrome vs. later a dashboard section)
- Navigation with `Link`, active-link states
- **Build:** Home, Browse (list from mock book data), Book detail page skeleton, basic metadata per page

### Phase 2 — Server vs Client Components
- Server Components by default, when/why to add `"use client"`
- Client/server boundary, composing client islands inside server pages
- `loading.tsx`, `error.tsx`, `not-found.tsx`
- **Build:** Search input (client) inside a server-rendered Browse page; loading/error states

### Phase 3 — Real Data Fetching & Caching
- Fetch from a real public API (Open Library or Google Books)
- `fetch` caching semantics, `revalidate`, static vs dynamic rendering, ISR
- Search/filter via `searchParams`
- **Build:** Replace mock data with the live API; cached + revalidated book detail pages

### Phase 4 — Client State: "My Shelf" (temporary, frontend-only)
- Local UI/app state, Context if needed, `localStorage` persistence
- Explicitly a **temporary stand-in** for a real backend (swapped for DB + auth later)
- **Build:** Add-to-shelf (want to read / reading / finished), star ratings, review text

### Phase 5 — Forms & Server Actions
- Server Actions vs traditional form submission vs client-side handlers
- Form validation
- Route Handlers as a mock API layer (foreshadows a real backend)
- **Build:** "Add a custom book" form via Server Action; a Route Handler backing the shelf data

### Phase 6 — Middleware & Auth-Ready Structure
- Middleware basics, route groups (`(public)` vs `(dashboard)`)
- Structuring the app now so real auth slots in cleanly later — no real auth yet
- **Build:** Route grouping refactor, a dummy protected-route scaffold

### Phase 7 — Polish: Images, Fonts, Accessibility, Responsive Design
- `next/image` for covers, `next/font`
- Accessibility pass (semantic HTML, focus states, ARIA where needed)
- Responsive layout pass
- **Build:** Apply across existing pages

### Phase 8 — Performance & Production Best Practices
- `generateMetadata`, sitemap/robots, bundle/perf review, dynamic imports where justified
- Revisit caching/revalidation choices made earlier
- **List virtualization** for `/books` (deferred from Phase 3): only render DOM nodes
  for visible book cards, likely via `@tanstack/react-virtual`. Note: the iTunes
  Search API has no real pagination (`offset` is a no-op, results hard-cap around
  ~200-210 regardless of `limit`), so this is about rendering performance for an
  already-fetched batch, not "infinite scroll" against the API.

### Phase 9 — Deployment
- Environment variables (dev vs prod), deploying to Vercel

### Phase 10 — Portfolio Polish
- README, architecture overview, key decisions, features list, screenshots, "what I learned," future improvements
- Finalize the Next.js cheat sheet

### Later (separate backend-learning phase, same repo)
- Real auth, database (shelves/reviews/users), file uploads (avatars), social features
- AI-powered recommendation feature (flagged above)

## Status
- [x] Project chosen
- [x] Roadmap finalized
- [x] Phase 0 — Mental model discussion
- [x] Phase 1 — Routing & Layouts
- [x] Phase 2 — Server vs Client Components
- [x] Phase 3 — Real Data Fetching & Caching
- [x] Phase 4 — Client State: My Shelf
- [x] Phase 5 — Forms & Server Actions
- [x] Phase 6 — Middleware & Auth-Ready Structure
- [x] Phase 7 — Polish (Images done; A11y/Responsive pass deferred, revisit later)
- [x] Phase 8 — Performance & Production Best Practices
- [x] Phase 9 — Deployment (live at https://book-shelf-taupe-delta.vercel.app)
- [ ] Phase 10 — Portfolio Polish