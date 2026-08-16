# Next.js Learning Journey — Phase-wise Learnings

Companion to `NEXTJS_LEARNING_PLAN.md`. That file tracks *what's done*; this one tracks
*what was actually learned, got wrong, and why* — meant to be useful months later.

---

## Phase 0 — Mental Model

**Core concept:** Next.js is a framework around React that adds a server as a
first-class part of the app — file-based routing, server rendering, and a
backend-lite (Route Handlers, Server Actions, Middleware) — instead of shipping a
blank HTML shell + JS bundle like a CRA/Vite SPA (pure CSR).

**Key takeaway — the default flips:** in plain React, every component is effectively
client-side. In Next.js App Router, **every component is a Server Component by
default**, rendered on the server with zero JS shipped to the browser unless it's
explicitly marked `"use client"`. This isn't just "less computation on the client" —
it also means:
- No client→API round trip for a component that only reads/renders data — the fetch
  happens on the server before HTML is sent.
- Server Components can safely use secrets/DB calls directly, since that code never
  reaches the browser.
- No classic CSR waterfall (mount → fetch → re-render); data can be fetched in
  parallel across the server component tree.

**Project setup notes:**
- Scaffolded with `create-next-app` → App Router, TypeScript, Tailwind v4.
- Running on **Next.js 16.3.1 / React 19.2.8** — newer than typical training-data
  knowledge, and the project's own generated `AGENTS.md` explicitly warns of breaking
  changes. Lesson: **check `node_modules/next/dist/docs` for the installed version's
  actual docs before assuming "classic" App Router behavior still applies.**
- `app/` is the router itself — no `index.html`, no `pages/` directory, no manual
  `ReactDOM.createRoot`. Next.js owns the entry point.
- Config file is `next.config.ts` by default now (TS, not `.js`/`.mjs`).

**Clarification — where does a Server Component's code actually run?**
Easy misconception: since everything renders instantly with no visible network
request or loading spinner, it can *feel* like Server Components are just regular
frontend code — "the server" seems theoretical. It isn't. Running `npm run dev`
starts a real Node.js server process on your machine, and Server Component code
(`app/books/[id]/page.tsx`, etc.) executes *inside that process* — the browser only
ever receives the resulting HTML + RSC payload, never the component's source or logic.

This is a real contrast with CRA/Vite: their dev server is a dumb static file server
plus hot-reload — it never executes your components; 100% of your component code
runs in the browser. In Next.js, the dev/production server is an active runtime that
renders Server Components before the browser ever sees them.

**Empirical proof, don't just take it on faith:** add a `console.log` inside a Server
Component (e.g. right after `const { id } = await params` in the book detail page)
and load that page. The log appears in the **terminal running `npm run dev`**, not
in the browser's DevTools console — direct evidence the component executed on the
server process, not on the client.

**Clarification — Client Components still render on the server too, once.**
`"use client"` does not mean "only ever runs in the browser." It means "this
component's JS ships to the browser and may use state/effects/event
handlers/browser APIs." Next.js still server-renders Client Components once for the
initial HTML (fast first paint + SEO), then **hydrates** in the browser — React
re-runs that same component's render logic client-side to attach interactivity and
reconcile with the server HTML. So a Client Component's render code genuinely
executes twice: once on the server, once in the browser (hence a `console.log`
inside one shows up in both the terminal and the browser DevTools console).

**Real bug hit from this:** an `async` function component directly `await`-ing
`params` while also marked `"use client"`. This is invalid — **only Server
Components can be `async` and directly `await` a promise to produce JSX.** Client
Components must render synchronously; async data has to arrive as an
already-resolved prop from a parent Server Component, or be fetched client-side
(`useEffect`, a data library, or the `use()` hook). The `console.log` still fired
because it executes before the broken return value causes a rendering error — a
reminder that "it logged" isn't proof something rendered correctly.

**Clarification — does the server always return full HTML?**
Only on the *first* load of a page (typing a URL, hard refresh): the server renders
the full tree to HTML and sends a complete document, plus an embedded **RSC payload**
(React's compact serialized description of the Server Component tree) used to
hydrate without redoing that work. On **subsequent client-side navigation** (clicking
a `next/link`), the server does *not* send a new full HTML document — the browser
fetches just the RSC payload for the new route, and React patches the existing DOM
with it. That's why `Link` navigations feel instant with no reload flash, unlike a
traditional multi-page app where every navigation is a fresh full-HTML round trip.

---

## Phase 1 — Routing & Layouts

**Concepts covered:** file-based routing, dynamic routes (`app/books/[id]/page.tsx`),
navigation via `next/link`, reading mock data in a Server Component.

**Version-specific gotcha (Next 16, carried over from Next 15):** `params` (and
`searchParams`) on page components are **`Promise`s, not plain objects**:
```tsx
interface BookProps {
  params: Promise<{ id: string }>;
}
const Book = async ({ params }: BookProps) => {
  const { id } = await params;
  ...
}
```
Anything expecting synchronous `params.id` access is outdated.

**New-but-optional typing sugar:** `create-next-app` generates layouts using an
auto-generated `LayoutProps<'/'>` type helper that infers `children`/`params` from
folder structure. Decided to skip it for now in favor of explicit
`{ children: React.ReactNode }` / manually-typed `params` — clearer while still
learning the underlying mechanics.

**Mistakes made and fixed along the way:**
- Used `export const Books = ...` instead of `export default` — Next.js only treats
  the **default export** of `page.tsx` as the route component; a named export is
  silently not rendered as the page.
- `React.FC<Props>` was used without importing `React`, and more importantly is
  disfavored in current Next.js/React code (issues with generics, implicit
  `children`) — replaced with a plain typed function:
  `const Book = async ({ params }: BookProps) => { ... }`.
- Hardcoded a literal `href="/books/[id]"` on every list link instead of
  interpolating the actual id — `href={`/books/${book.id}`}`. Easy bug to miss
  because the route *looks* like it should just work with the literal bracket
  syntax; it doesn't — brackets are only a routing convention for the file system,
  not a runtime template.
- Left instructional/placeholder text as literal JSX content instead of removing it
  before treating a component as "done."

**Known gap, deferred on purpose:** visiting a book `id` that doesn't exist in the
mock data currently renders a blank page instead of a proper 404 — intentionally left
unhandled until Phase 2, which introduces `notFound()` / `not-found.tsx`.

**Why this matters in real apps:** dynamic routes + Server Component data access is
the backbone of most content-driven Next.js apps (e-commerce PDPs, blogs, docs sites)
— get the params/async pattern and default-export requirement wrong and *nothing*
else in the app works correctly, even if the UI looks fine in isolation.

---

## Phase 2 — Server vs Client Components

**`"use client"` is a file-level boundary, not a per-JSX-element one.** You can't mark
just one piece of JSX inside a Server Component's file as "client" — the directive
applies to everything that file exports. So an interactive piece (like a search
input) has to be extracted into its **own file** with its own `"use client"` at the
top, kept as a small "client island" embedded inside an otherwise server-rendered
page. Putting `"use client"` on the whole page instead would convert *all* of it
(including data fetching/mapping) into client-rendered code — losing zero-JS
rendering for the parts that don't need interactivity, and becoming incompatible
with `async`/`await` data fetching (Client Components can't be `async` functions).

**Why the search input can't be a Server Component at all:** it's not a question of
*where filtering happens* — it's that Server Components have no persistent instance
on the server waiting to react to a browser keystroke. `onChange` handlers and
`useState` are client-only concepts (they need JS attached to the DOM node in the
browser). Confirmed empirically: writing `useState`/`onChange` inside a Server
Component fails at build time with explicit errors ("this hook only works in a
Client Component" / "Event handlers cannot be passed to Client Component props") —
Next.js refuses to let interactivity be silently half-broken.

**"Lift state up" doesn't work the normal React way when the parent is a Server
Component.** A Server Component has no `useState` and doesn't re-render in response
to a callback — it only renders once per request. So instead of the child reporting
back up to a server-rendered parent, the pattern is either:
1. Pull the whole interactive slice (input + list) into **one Client Component**
   that receives the raw data as a prop from the Server Component parent and owns
   all the interactive state/filtering itself (used for `BooksBrowser.tsx`, since the
   mock data is a small in-memory array) — the Server Component's only job becomes
   supplying data.
2. Encode the interactive state in the **URL's `searchParams`** instead of React
   state, and let the Server Component re-render via navigation reading those
   params — the right pattern once real API-backed search needs to happen
   server-side (Phase 3).

**Derived state should be computed during render, not duplicated in its own
`useState`.** Initially stored the filtered book list in a second `useState`
(`bookItems`), manually keeping it in sync inside `onChange` — redundant, since it's
100% derivable from `query` + `books`. Removed the extra state and computed
`filteredBooks` directly in the render body instead.

**Real bug from this pass:** filtering used `.includes()` directly on `query` and
book fields — case-sensitive, so typing "hobbit" wouldn't match "The Hobbit". Fixed
by lowercasing both sides before comparing.

**TypeScript note:** a native `<input>`'s `onChange` is typed as
`ChangeEvent<HTMLInputElement>` (from `react`) — a generic synthetic event
parameterized by the target element, so `e.target.value` type-checks correctly
instead of being `any`.

**`notFound()` + `not-found.tsx`:** calling `notFound()` (from `next/navigation`)
inside a Server Component immediately halts rendering, renders the nearest
`not-found.tsx` for that route segment, and makes Next.js return a **real HTTP 404**
status — something a client-rendered SPA can't do (it can only fake a "not found"
UI while still returning `200`). `not-found.tsx` can be scoped per route segment
(`app/books/[id]/not-found.tsx`) or app-wide (`app/not-found.tsx`).

`notFound()` is typed to return `never` — it always throws internally rather than
returning normally, so code after it never executes. That means
`if (!book) { notFound(); }` doesn't need `return notFound()` or a `return` right
after it; the `never` return type is also what lets TypeScript narrow `book` to
non-`undefined` for the rest of the function afterward (no more `book?.title`
needed — just `book.title`).

**`loading.tsx`:** a special file that Next.js automatically uses as a Suspense
fallback for a route segment while its Server Component is rendering/awaiting data —
no manual `isLoading` state needed, unlike a plain React app where every
data-fetching component has to track that itself. Since the mock data resolves
instantly, a temporary artificial `await new Promise(res => setTimeout(res, 2000))`
delay was added to actually observe the fallback — flagged to remove once Phase 3
introduces real network latency.

---

## Phase 3 — Real Data Fetching & Caching

**Public APIs go down — verify reachability before building against one.** Planned
to use Open Library, but it was fully unreachable (TCP connection timeout, not a DNS
issue). Fallback Google Books API was reachable but rate-limited (`429`). A third
fallback (Gutendex) also timed out. Direct `curl` testing (not just "it's a
well-known API so it should work") was what actually diagnosed this — general
internet access worked fine (`google.com` returned `200`), so it was specific to
those hosts, not a broken environment. Eventually landed on the **iTunes Search API**
(`itunes.apple.com/search?term=...&entity=ebook`) — reachable, no key required, and a
good field match for a general reading tracker (real cover art via `artworkUrl100`,
upsizable by replacing the size in the URL path, e.g. `100x100` → `600x600`).

**`fetch()` resolves with a `Response` wrapper first; the body is read separately.**
`console.log(res)` printed the `Response` object (status, headers, an unread
`ReadableStream` body) — not the actual data. Needed `await res.json()` as a second
step to get the parsed payload. This is standard `fetch` API behavior, not
Next.js-specific.

**Default parameters only trigger on `undefined`, never on other falsy values.**
`searchBooks(query: string = "bestseller")` looked like it would fall back to
`"bestseller"` for an empty search, but an explicitly passed `""` is still a defined
value — the default never kicks in for it. Real consequence: clearing the search box
computed `""` and passed it explicitly, silently skipping the fallback and showing
"no results" instead of the bestseller list. Fixed by handling "what counts as empty"
*inside* the function instead of relying on the default param mechanism:
`const term = query.trim() || "bestseller";`.

**HTML tags and HTML entities are two different things — stripping one doesn't
handle the other.** iTunes descriptions contain both (`<b>` tags and entities like
`&#xa0;`). A regex that strips `<...>` tags has no reason to also decode
`&#xa0;` into a real character. Rather than hand-rolling entity decoding (there are
hundreds of named entities — easy to get subtly wrong), pulled in `he`, a small
purpose-built library, and applied it *after* tag-stripping (stripping first avoids
accidentally treating a decoded `&lt;`/`&gt;` as real markup).

**The same plain utility function can execute on the server or in the browser,
depending entirely on which component calls it — not on anything in the function
itself.** `searchBooks`/`getBook` in `lib/books.ts` have no `"use client"`/`"use
server"` of their own. Called from `page.tsx` (a Server Component), the call runs in
Node during server rendering. Called from `BooksBrowser.tsx` (marked `"use client"`),
that same function gets bundled into client JS and runs in the browser instead. This
worked functionally only because iTunes's API allows cross-origin requests
(`access-control-allow-origin: '*'`) — a real backend requiring an API key would have
leaked that key to the browser in this setup. Confirmed the split empirically: no
direct request to `itunes.apple.com` appears in the browser's Network tab on initial
page load (fetched server-side before HTML arrived), but typing in the search box
*does* show a direct browser → `itunes.apple.com` request.

**Debouncing is fundamentally a client-side-only technique for this use case — not
just a style choice.** Considered debouncing inside the Server Component or wrapping
`searchBooks` itself in a debounce function, but both break down structurally:
- A Server Component has no persistent instance between requests — it only runs when
  a request actually arrives. By the time it runs, the client has already decided to
  send that request; there's nothing left to "collapse."
- A debounce wrapper that cancels earlier calls in favor of the latest is fine for a
  client event handler (the cancelled calls were never sent as real requests), but
  fatal for server requests — each one is a real HTTP request a specific browser is
  waiting on; "cancelling" it server-side just leaves that request hanging forever.
- A server-side debounce timer would also be shared, global state across the whole
  Node process serving *every* user — not scoped per-user like a browser tab's
  closure naturally is.

The fix has to live where individual keystrokes are actually observed over time: the
client, specifically the point that decides whether to call `router.replace` at all.

**Refactored search from client-side state to a `searchParams`-driven server
pattern:**
- `page.tsx` (Server Component) now receives `searchParams: Promise<{ q?: string }>`
  as a prop (same async-params pattern as dynamic route `params`), reads `q`, and
  calls `searchBooks(q)` server-side.
- `BooksBrowser.tsx` (Client Component) uses **`useSearchParams()`** — a *hook*, only
  usable in Client Components — to read the current URL's query string. Easy to
  confuse with the Server Component's `searchParams` **prop**: same name, two
  completely different APIs, one per component type.
- `useRouter()` comes from `next/navigation` (App Router) — not the legacy
  `next/router` (Pages Router). `router.replace(url, { scroll: false })` updates the
  URL without a full reload; `{ scroll: false }` stops Next.js's default
  scroll-to-top-on-navigation behavior, which would otherwise yank the page up every
  time a debounced search fires while the user has scrolled into the results.
- Once search is URL-driven, `BooksBrowser` no longer needs its own fetched-books
  state at all — the `books` prop (recomputed server-side whenever the URL's `q`
  changes) becomes the single source of truth. The component only keeps local state
  for the input's own immediate typed value.
- Debounce implementation gotchas hit along the way: `useRef<Timeout>(null)` — not a
  real type; correct is `useRef<ReturnType<typeof setTimeout> | null>(null)` (works
  regardless of whether DOM or Node's `setTimeout` typing wins). `clearTimeout(ref)`
  instead of `clearTimeout(ref.current)` — passes the ref object itself, not the
  timer handle. Guarding the reschedule on `timeoutId.current` being truthy skipped
  scheduling entirely on the very first keystroke (started `null`). Omitting the
  delay argument (`setTimeout(fn)`) defaults to `0`ms — silently not debouncing at
  all.

**Fetch caching, applied and verified:**
- Confirmed for this Next.js version (16.3.1, no Cache Components enabled — the
  "Previous Model"): `fetch()` is **not cached by default** — this flipped in Next 15
  and remains true here. Opting in: `fetch(url, { next: { revalidate: 3600 } })`.
- Added `revalidate: 3600` to both `getBook` (detail page) and `searchBooks` (list).
- **The fetch-level cache and the page-level render are two different layers.** Docs
  confirm: "In Development, Pages are always rendered on-demand and are never
  cached" — so a Server Component's own function body (and any `console.log` in it)
  reruns on every dev reload regardless of `revalidate`. That does *not* mean the
  underlying `fetch` call is uncached — to actually observe fetch-level caching,
  logged `res.headers.get("date")` (the real HTTP response timestamp from Apple's
  server) instead of just a marker log: reloading the same book repeatedly within the
  revalidate window showed an *identical* date (served from cache, no real network
  call), while reloading after the window expired showed a fresh, changed date.
- **The cache key is the request itself (URL, for a plain GET) — not the "concept" of
  a search.** `searchBooks("hobbit")` and `searchBooks("biology")` build different
  URLs and get entirely independent cache entries/windows. The cache is also global
  across all users hitting the server, not scoped per browser session — one user's
  cached "hobbit" search can directly serve a different user's identical search
  moments later. Practical consequence: caching helps a lot for a bounded,
  frequently-repeated resource (a book id), much less predictably for open-ended
  free-text search, where most distinct queries are cache misses on first use.

**Environment note:** `npm install` warned that Next.js 16.3.1 requires Node
≥20.9.0, but this machine runs Node v18.18.2 (`EBADENGINE`). Things have worked so
far, but this should be upgraded at some point — running a framework on an
unsupported Node version can cause obscure issues later.

---

## Server Components vs. Client Components — how each actually renders

*(Consolidates and extends the render-model notes scattered across Phase 0 and
Phase 2, now with the full picture from building real client/server interplay in
Phase 3.)*

**Server Component (default for everything unless a file has `"use client"`):**
- Executes only on the server — in the Next.js dev/production Node process (or at
  build time, for statically-generated routes). Its source code and logic are never
  sent to the browser; the browser only ever receives the *result* (HTML, plus a
  serialized RSC payload describing the component tree for hydration/patching).
- Can be an `async` function and directly `await` data (`fetch`, a database call,
  etc.) right in the component body — no `useEffect`, no loading state of its own.
- Has no access to browser-only things: no `useState`, no event handlers, no
  `window`/`localStorage`.
- In dev mode, **always re-executes on every request** — confirmed both empirically
  (a `console.log` fires every reload) and in the official docs ("Pages are always
  rendered on-demand" in development). In production, whether it re-executes per
  request depends on the route's rendering strategy (static/ISR/dynamic) — separate
  from whether an individual `fetch` inside it is cached.

**Client Component (`"use client"` at the top of a file):**
- Its JS *does* ship to the browser — but that doesn't mean it *only* runs there.
  Next.js still server-renders a Client Component **once**, to produce the initial
  HTML (fast first paint, SEO), exactly like a Server Component would — this first
  render happens in the same server process, before anything reaches the browser.
- The browser then **hydrates**: React re-runs that same component's render logic
  client-side, attaches real event listeners/state, and reconciles with the
  server-rendered HTML already sitting in the DOM. So a Client Component's render
  logic genuinely executes twice for the very first load — server, then browser.
- After hydration, its own internal re-renders (state changes, effects, typing in a
  controlled input) happen **only in the browser** — no server round-trip for each
  one. `BooksBrowser`'s `query` state updating on every keystroke is a purely
  client-side re-render; only the *debounced* `router.replace` afterward causes an
  actual new server request.
- Cannot be an `async` function that `await`s data directly to produce JSX — that's
  Server-Component-only. Async data has to arrive as a prop from a Server Component
  ancestor, or be fetched client-side (effects, a data library).
- A plain function/module with no `"use client"`/`"use server"` of its own (like
  `lib/books.ts`) isn't inherently "a server thing" — it simply executes wherever the
  importing component executes. Imported into a Server Component, it runs on the
  server; imported into a Client Component, the same code ships to and runs in the
  browser. This is exactly what happened with `searchBooks`/`getBook` in Phase 3.

**How a `searchParams`-driven navigation actually updates the page (ties Phase 0's
navigation notes to this project):** when `BooksBrowser` calls `router.replace` with
a new `?q=`, Next.js does **not** reload the whole page or re-run the initial
SSR-then-hydrate sequence. It sends a request for just the new RSC payload (the
updated Server Component tree for the new `searchParams`), and React patches the
*already-hydrated* client tree in place — `BooksBrowser` itself isn't remounted, it
just receives a new `books` prop and re-renders normally as a mounted client
component would from any other prop change.

---

## Phase 4 — Client State: "My Shelf"

**Why this needed Context instead of local `useState`:** the shelf (want-to-read /
reading / finished, ratings, reviews) is read and written from multiple
routes/components (book detail page, eventually a dedicated shelf page) — prop
drilling across unrelated route trees isn't practical, so it's a genuine case for
shared client state via React Context.

**Composing a Client Context Provider without making the whole app client-side:**
a Context Provider needs `useState`, so it must be `"use client"` — but the root
layout (`app/layout.tsx`) that mounts it stays a Server Component:
```tsx
// Server Component layout
<ShelfProvider>{children}</ShelfProvider>
```
Passing Server-rendered `children` into a Client Component doesn't convert those
children into Client Components — only `ShelfProvider` itself needs the client
boundary. Mounting it in the *root* layout matters because layouts persist across
client-side navigation, so shelf state survives moving between routes.

**React 19 syntax note:** `<ShelfContext value={...}>` — rendering a Context object
directly as a JSX tag — is new in React 19, replacing the older
`<ShelfContext.Provider value={...}>`. Both still work; the direct form is just
less verbose.

**The `localStorage` + SSR gotcha, hit in practice:** reading `localStorage` directly
inside a `useState` initializer crashed, because Client Components still render once
**on the server** first (same lesson as Phase 0/2), and `localStorage` doesn't exist
in Node. Fix: initialize state to a default (`[]`), then read from `localStorage`
inside a `useEffect` (browser-only) and call `setState` there.

**New ESLint rule hit: `react-hooks/set-state-in-effect`.** Calling `setState`
directly inside a `useEffect` is now flagged by default (part of
`eslint-plugin-react-hooks`'s React Compiler rule set). Its own error message names
the real anti-pattern it's guarding against: deriving state from props/state that
could just be computed during render, causing avoidable cascading re-renders. A
one-time read from an external store (`localStorage`) on mount is explicitly one of
react.dev's own examples of a *valid* effect — this rule can't tell the two cases
apart automatically. Resolved by suppressing the rule on that specific line with a
comment explaining why, rather than either ignoring the warning silently or
over-building a full `useSyncExternalStore`-based store (which the rule's message
also names as the "fully rigorous" fix) — the latter is real, correct, but far more
machinery than a temporary, single-tab `localStorage` stand-in needs.

**Writing to `localStorage` belongs in its own effect, separate from reading.**
Initially called `localStorage.setItem` *inside* each action's state updater
callback (`addToShelf`, etc.). Problem: React Strict Mode (on by default in dev)
intentionally double-invokes state updater functions to help surface impurities —
so a side effect living inside one would fire twice per action. Moved persistence
into a single `useEffect(() => { localStorage.setItem(...) }, [shelfList])` instead —
matches the lint rule's own recommended shape ("update external systems with the
latest state from React") and keeps the action functions as pure state
transformations.

**Real bugs hit and fixed along the way (plain JS, not Next.js-specific, but worth
remembering):**
- `setState((prev) => ({...prev, item}))` on an **array** — spreading an array like
  an object turns it into `{0: ..., 1: ..., item: ...}`, not an appended array. Fix:
  `[...prev, item]`.
- `.forEach()` (and later a `.map()` whose result was never assigned) used to
  "update" an item in place — both discard whatever the callback computes unless the
  result is actually captured/returned. Fix: `prev.map((it) => (match ? item : it))`,
  using the returned array directly.
- `{...prev}.filter(...)` — same array-as-object mistake; plain objects have no
  `.filter` method, so this throws at runtime. `.filter` already returns a new array
  without mutating the original — no spread needed at all.

---

## Phase 5 — Forms & Server Actions

**Route Handlers earn their keep only for consumers outside your own Server
Component tree.** First built `app/api/custom-books/route.ts`'s `GET`, then
immediately hit the classic mistake: calling `fetch('/api/custom-books')` *from a
Server Component*. That throws (`Failed to parse URL from /api/custom-books`)
because server-side `fetch` has no implicit origin to resolve a relative URL
against — unlike the browser, which resolves against `window.location`. The real
fix wasn't "use an absolute URL," it was recognizing the anti-pattern: don't fetch
your own Route Handler from a Server Component at all. Pulled the actual logic into
a plain shared function (`getCustomBooks()` in `app/lib/customBooks.ts`) that both
the Route Handler *and* the page call directly — no network round-trip needed when
it's all the same server process. Route Handlers become genuinely useful for: a
Client Component's browser-side `fetch` (relative URLs resolve fine there), a
traditional no-JS `<form>` submission, or any external consumer (mobile app,
webhook, third-party service) that isn't part of the app's own React tree.

**`request.formData()` returns a `FormData` object — you can't destructure fields
off it like a plain object.** `const {title} = await request.formData()` type-errors
because `FormData` has no `title` property. Correct: `formData.get("title")`, which
returns `FormDataEntryValue | null` (`string | File | null`), so it needs narrowing
(`typeof title !== "string"`) before use — never a guaranteed string. Chose
`formData()` over `request.json()` specifically because a *traditional* HTML form
submission sends form-encoded data, not JSON — using `formData()` lets one handler
serve both a plain form and a JS-driven `fetch` the same way.

**Server Actions vs. Route Handler vs. client-side `fetch` — built the same
"add a book" feature three ways to compare directly:**
- **Server Action** (`"use server"` function passed to a form's `action`): least
  code, no URL/endpoint to manage, works with zero JavaScript (progressive
  enhancement — Next.js compiles it to a real POST under the hood). After mutating,
  called `revalidatePath("/books")` so the page's cached data is treated as stale on
  next visit. This is the version kept as the actual live feature — the other two
  are commented out in `page.tsx`, preserved for reference.
- **Traditional `<form action="/api/..." method="POST">`, zero JS**: the browser
  does a real full-page navigation to wherever `action` points and renders whatever
  the response is. First version returned raw JSON (`{success: true}`) — after
  submitting, the browser literally displayed that JSON as a blank page. Fixed with
  the **POST → Redirect → GET** pattern: `NextResponse.redirect(new URL("/books",
  request.url), 303)`. `303 See Other` specifically (not 301/302) is the correct
  status for POST-then-redirect — it tells the browser to switch to `GET` when
  following, and prevents a "resubmit form?" warning on refresh. (Left as a known
  gap: the *error* path still returns raw JSON for this version — showing a
  validation error after a real redirect needs a different mechanism, e.g. an
  `?error=...` query param the page reads back.)
- **Client-side `fetch`**: a Client Component's own `onSubmit`/form-`action`
  function, `event`-free via React 19's "a plain client function can be a form's
  `action` too" (not just Server Actions) — React auto-builds the `FormData` and
  calls it, no manual `preventDefault()` needed. Nothing auto-refreshes stale data
  here, unlike the Server Action — had to explicitly call `useRouter().refresh()`
  after a successful request. Since `route.ts`'s `POST` redirects (built for the
  no-JS case), `fetch` transparently follows that redirect and downloads the whole
  `/books` HTML as its "response" — wasteful but harmless, since this version never
  reads the response body anyway. The real advantage this version buys: custom
  pending/error UI (a disabled "Adding..." button) without a full page reload —
  something neither other approach can do.

**Real bugs hit building the client-fetch version:**
- Input `name="name"` but code read `formData.get("title")` — silent mismatch,
  always `null`, validation always failed, submission silently never worked.
- `fetch(url, { method: "POST" })` with no `body` at all — extracted
  `title`/`author`/`description` from the form's `FormData` for validation, then
  never actually attached them to the request. The original `formData` object was
  already sitting right there and could just be passed as `body` directly.

**Biggest gotcha of the phase: module-level in-memory state is not reliably shared
across different Next.js "entry points."** After fixing the traditional-form path,
newly added books didn't appear back on `/books` — but `GET /api/custom-books`
*did* show them. Verified empirically (not just assumed) by logging a random
`instanceId` generated once at module load, from both `addCustomBook` (called via
the Route Handler) and `getCustomBooks` (called via the page): **the two logged
completely different ids** — proof the Route Handler and the page/Server Action
each got their own separate compiled instance of the same `customBooks.ts` module,
each with its own independent in-memory array. Next.js compiles Route Handlers and
pages as separate entry points/bundles (this matters even more in production, where
each can end up in a separate serverless function) — a plain `let` array at module
scope is not a safe shared store across them. Fixed by moving the store to a JSON
file on disk (`data/custom-books.json`, gitignored) — a file lives outside the JS
module system entirely, so every entry point reads/writes the same data regardless
of which bundle it's compiled into. Still explicitly a temporary stand-in (no
concurrent-write safety, no real querying) — a genuine database removes this
problem entirely, which is *why* production apps don't reach for in-memory arrays
for anything beyond a single, one-off computation.

---

## Phase 6 — Route Groups & Proxy (formerly Middleware)

**Middleware is called Proxy as of Next.js 16.** Confirmed directly from the docs:
*"Starting with Next.js 16, Middleware is now called Proxy to better reflect its
purpose. The functionality remains the same."* Concretely: file is `proxy.ts`
(not `middleware.ts`), the exported function should be named `proxy` (not
`middleware`), and `export const config = { matcher: [...] }` is unchanged. A real
behavioral change, not just cosmetic: Proxy **always runs on the Node.js runtime** —
Edge isn't supported for it at all (old Middleware ran on Edge). Without a
`matcher`, it would run on every single request, including static assets — easy to
accidentally gate CSS/JS/images if you forget to scope it.

**Real bug hit: `proxy.ts` placed inside `app/` instead of the project root.**
Docs are explicit: *"Create a `proxy.ts` file in the project root, or inside `src`
if applicable, so that it is located at the same level as `pages` or `app`."* It
must be a **sibling** of `app/`, not nested inside it — inside `app/`, it's simply
never picked up/run at all, with no error, just silent no-op. Easy mistake since
almost everything else we've built lives inside `app/`.

**Route Groups** (`app/(public)/`, `app/(dashboard)/`) — parentheses are the *only*
syntax for this; there's no alternative spelling. They organize files/apply
different structure without adding a URL path segment — `app/(dashboard)/shelf/`
is still just `/shelf`. The real alternative isn't a different syntax, it's a
different *decision*: skip grouping entirely and use a plain folder
(`app/dashboard/shelf/`), accepting `/dashboard/shelf` as a real, visible URL
segment instead of a clean `/shelf`.

**Moving routes into a group changes relative import depth, even though URLs don't
change.** `app/books/page.tsx`'s `../lib/books` became `../../lib/books` once
the file moved to `app/(public)/books/page.tsx` — the parenthesized folder doesn't
affect *routing*, but it's still a real directory the file system (and relative
imports) must account for. Imports using the `@/...` alias were unaffected, since
those resolve from the project root regardless of file depth.

**Building a fake-but-structurally-real auth gate:** `proxy.ts` checks
`request.cookies.get("session")` and redirects to `/` if missing — exactly the
shape real auth will use later (a real session/JWT check instead of a fake cookie
name). A `app/api/fake-login/route.ts` sets that cookie
(`response.cookies.set("session", "fake-value")`) and is what a real login
endpoint's response would eventually do too.

**The exact same POST→redirect→GET lesson from Phase 5 resurfaced here.** First
version of `fake-login`'s `GET` handler set the cookie but returned
`NextResponse.json({success: true})` — clicking a real link to it would've just
displayed raw JSON instead of landing back on `/shelf`, same mistake as the
traditional form in Phase 5. Fixed with `NextResponse.redirect(new URL("/shelf",
request.url))` — worth remembering as a recurring pattern: **any endpoint reached
via a real browser navigation (a link, a non-JS form) must respond with a redirect
to be useful, not JSON**, regardless of which Next.js primitive it's built with.

**`NextResponse.redirect`'s default status is `307`,** not `303` like the Phase 5
POST→redirect→GET case — `307 Temporary Redirect` preserves the original request
method, which is correct here since a plain link navigation is always a `GET`
being redirected to another `GET`. `303` specifically exists for converting a
`POST` into a following `GET` — different status codes for different sequences of
methods, not interchangeable.

---

## Phase 7 — Images, Fonts, Accessibility, Responsive Design

**Fonts were already done right, from the original `create-next-app` scaffold.**
`layout.tsx` has used `next/font/google` (`Geist`/`Geist_Mono`) since day one —
self-hosted, zero layout shift, automatically subsetted. Worth explicitly
recognizing as already-correct rather than assuming everything needs rebuilding.

**`next/image` isn't just "a nicer `<img>`" — it moves the image fetch onto your
own server, and that's the whole reason the config step exists.** A plain
`<img src="https://...">` is fetched entirely by the *browser*; the server is never
involved. `next/image` renders an `<img>` pointing at `/_next/image?url=<encoded
src>&w=...&q=...` — a route Next.js's own server handles. When the browser
requests that, **the server** fetches the original URL, resizes/re-encodes it
(e.g. to WebP), caches the result, and serves that back. That's the only way the
optimization (responsive sizing, format conversion) can happen at all.

**`images.remotePatterns` is an SSRF allowlist, not just "where images live."**
Since the server itself now makes outbound requests to whatever URL ends up in an
`Image`'s `src`, an unrestricted allowlist would mean: if any of those URLs could
ever be influenced by user input, an attacker could get the server to fetch
internal/private endpoints (cloud metadata services, internal APIs, `localhost`
services) on their behalf, with the response proxied back through the image
optimizer — a textbook SSRF. `remotePatterns` forces an explicit, pre-declared list
of trusted hosts. Verified this empirically rather than just asserting it: hit
`/_next/image?url=<some non-allowlisted host>` directly and got back `400` with
body `"url" parameter is not allowed` — proof the check happens *before* any
outbound fetch is attempted, not as a fetch-then-discard.

**Real bug hit: `next/image` is strict about `src` in a way plain `<img>` never
was.** Custom books used a placeholder `coverUrl: "nothing"` (not a real URL) as a
stand-in for "no cover yet." A plain `<img src="nothing">` just silently renders a
broken-image icon in the browser — harmless. `next/image` throws a hard server
error instead: `Failed to parse src "nothing"... it must start with a leading
slash or be an absolute URL`. Fixed by using an empty string (`""`) instead, which
the existing `{book.coverUrl && (...)}` conditional already correctly treats as
"skip the image" (same fallback already used for real books lacking cover art).

**`width`/`height` are required, not optional decoration** — they're what lets
the browser reserve the correct space before the image loads, preventing layout
shift (CLS). Used `width={80} height={112}` to match the existing `h-28 w-20`
Tailwind box (`28 * 4px = 112px`, `20 * 4px = 80px` — Tailwind's spacing scale is
`0.25rem`/4px per unit).

**`next.config.ts` changes require a full dev server restart** — unlike component
code, config changes aren't picked up by Fast Refresh.

---

## Phase 8 — Metadata/SEO, Sitemap, List Virtualization, Perf Review

**Why per-page metadata matters more in Next.js than in a plain CRA/Vite SPA.**
Metadata controls three real things: the browser tab/history/bookmark title;
search-engine result snippets (`title`/`description` are literally what shows up
in Google); and rich preview cards when a link is shared (Slack, iMessage,
Twitter — via Open Graph tags). In a pure client-rendered SPA, the raw HTML a
crawler or link-preview bot receives is nearly empty (a `<div id="root">` and a
script tag) — the `<title>` can't meaningfully differ per route without
client-side `document.title` hacks that many bots never execute JS to see. Since
Next.js renders on the server, real per-page `<title>`/`<meta>` tags are already
in the HTML response before any JS runs — the same "SEO and fast first paint"
reasoning from Phase 0, just applied to `<head>` instead of the page body.

**`generateMetadata` has to be a function, not a static object, specifically
because the title depends on fetched data** (the book's actual title) — only
known at render time, and only fetchable directly, server-side, by a Server
Component. Calling `getBook(id)` separately in both `generateMetadata` and the
page component doesn't cause two network requests — Next.js dedupes identical
`fetch` calls (same URL + options) within a single render pass automatically.

**`sitemap.ts`/`robots.ts` have a specific required shape — same mistake as
`route.ts` handlers needing exact export names.** First attempt exported a plain
array of strings (`["/", "/books"]`) from `sitemap.ts` — wrong on two counts: the
default export must be a **function** (matching the same convention as
`robots.ts`), and it must return objects (`{ url, lastModified, changeFrequency,
priority }`), not bare strings. Produced a `500` until fixed.

**A sitemap can only enumerate a *bounded, known* set of URLs.** `/books/[id]`
pages are backed by the entire iTunes catalog with no "list all books" endpoint —
there's no way to honestly enumerate every possible book id, so the sitemap only
includes the static pages (`/`, `/books`). Not a shortcut — the actual correct
answer given this data source. A real backend with its own book table could
enumerate every book it actually has.

**List virtualization (`@tanstack/react-virtual`), deferred from Phase 3:**
- Virtualizing a 2-column grid means changing what counts as "one item" from
  *one book* to *one row of up to 2 books* — the virtualizer only understands
  stacking single items vertically, so books are chunked into row-pairs before
  being handed to it; the 2-column CSS still applies, just inside each
  individually-positioned row rather than across the whole list.
- Since the grid scrolls with the whole page (no inner scrollable container),
  needed `useWindowVirtualizer` specifically, not the standard `useVirtualizer`
  (which expects a bounded scroll container to measure).
- `scrollMargin` tells the virtualizer how far the list sits from the top of the
  page (since the search input sits above it) — without it, window scroll
  position and "which rows are visible" would be miscalculated.
- **Real bug hit: reading `ref.current` directly during render.** A newer
  ESLint rule (`react-hooks/refs`, same family as Phase 4's
  `set-state-in-effect`) flags this — a ref is `null` on the first render before
  anything's mounted, and reading `.current` doesn't subscribe the component to
  future changes, so there's no guarantee a re-render happens once the real
  value is known. Fixed the same way as the Phase 4 `localStorage` read: measure
  in a `useEffect` (runs after DOM commit, ref is populated), store via
  `useState`, let the state update trigger a proper re-render.
- **Real bug hit: forgot to wire up dynamic height measurement, causing visibly
  inconsistent gaps between rows.** The virtualizer positions rows using a flat
  `estimateSize` (190px) *until* it's told the real rendered height of each item
  — via `ref={virtualizer.measureElement}` on each rendered row, paired with
  `data-index={virtualRow.index}`. Without that, every row was positioned as if
  it were exactly 190px tall regardless of actual content (titles wrapping to 1
  vs. 2 lines, variable description length), producing uneven gaps — rows
  shorter than the estimate left extra whitespace before the next one; rows
  taller than the estimate visually crowded into the next row's space.

**Quick bundle/caching review — a legitimate outcome was "nothing needed
changing."** Checked the production build's route classification
(`next build`'s static ○ / dynamic ƒ markers) rather than guessing: `/books`,
`/books/[id]`, and both API routes correctly show as dynamic (they depend on
live data/params); `/`, `/shelf`, `robots.txt`, `sitemap.xml` correctly show as
static. No heavy import exists that would justify a `next/dynamic` code-split
right now (`@tanstack/react-virtual` is already scoped to just the one Client
Component that needs it). `getCustomBooks`/`addCustomBook` read/write a plain
file (not `fetch`), so they're correctly never cached by Next's Data Cache at
all — right behavior, since a just-submitted book needs to show up immediately.
Confirming a review found nothing to change is a valid, honest outcome — not a
gap to manufacture a fix for.
