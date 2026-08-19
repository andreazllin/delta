# diff

Paste two blocks of text, compare them, and read the result as a real diff —
split or unified, syntax highlighted, with word-level change highlighting.

The diff rendering is the same engine [diffshub][diffshub] uses:
[`@pierre/diffs`][diffs]. Instead of pulling files from a repository URL, this
app diffs the two texts you type in.

[diffshub]: https://github.com/pierrecomputer/pierre/tree/main/apps/diffshub
[diffs]: https://www.npmjs.com/package/@pierre/diffs

## Stack

| Piece      | Choice                                                    |
| ---------- | --------------------------------------------------------- |
| Build      | Vite 8 + React 19                                         |
| Routing    | TanStack Router (file-based, `src/routes/`)                |
| Styling    | Tailwind CSS v4                                           |
| Components | shadcn `base-vega` style (Base UI) + ReUI registry         |
| Diff       | `@pierre/diffs` (`FileDiff` from its React entry)          |
| Package    | pnpm                                                      |

## Run

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # typecheck, then production build
pnpm typecheck
```

## Screens

- `/` — two text panes side by side and a **Compare** button.
- `/compare` — the diff, with layout, wrapping, syntax, and display controls
  (line numbers, change backgrounds, collapse unchanged, change indicators).

The pair is held in a module store mirrored into `sessionStorage`, so
`/compare` survives a reload. Viewer settings and the color mode persist in
`localStorage`.

## How the diff is computed

`src/lib/compute-diff.ts` calls `parseDiffFromFile` from `@pierre/diffs`. That
is the same function `MultiFileDiff` uses internally: it builds a unified patch
with jsdiff and parses it into `FileDiffMetadata`. A diff of two pasted texts
therefore renders exactly like a diff parsed from a real git patch.

Three details worth knowing:

- Identical inputs produce zero hunks rather than an error, which is what the
  "texts are identical" state checks.
- The patch is generated with **full context**, not jsdiff's 4-line default.
  Anything the patch omits is simply not in the diff, and diffshub recovers it
  by fetching whole files through `loadDiffFiles`; both texts are already in
  memory here, so every pasted line is rendered. **Collapse unchanged** in the
  settings menu narrows the context back to 4 lines on request.
- Both sides share one filename, so the cache key `@pierre/diffs` derives for
  highlight reuse is content-hashed. Without that, edited text would render
  against a stale cache entry.

Neither pane has a filename to infer a language from, so the toolbar carries an
explicit syntax picker (`src/lib/languages.ts`) and passes `lang` through.

## Components

ReUI is a shadcn registry, not a replacement for one. It ships 21 custom
primitives (Alert, Badge, Data Grid, Tree, …) plus component examples; base
primitives like Button and Textarea come from shadcn core in the `base-vega`
style, which is what ReUI's own examples depend on. So:

- `src/components/reui/` — ReUI primitives (`@reui/badge`, used for the
  diffstat).
- `src/components/ui/` — shadcn `base-vega` primitives, built on Base UI.

`src/index.css` imports `shadcn/tailwind.css` for the custom variants those
components need (`data-open:`, `data-checked:`, …), and defines ReUI's extended
semantic tokens (`--success`, `--warning`, `--info`, `--invert`, `--focus`).

Installing more:

```bash
pnpm dlx shadcn@latest add textarea          # shadcn core, base-vega style
pnpm dlx shadcn@latest add @reui/alert       # ReUI primitive
pnpm dlx shadcn@latest add @reui/c-alert-1   # ReUI example
```

Premium ReUI items need `REUI_LICENSE_KEY` in `.env.local`; `components.json`
already forwards it as a bearer token.

## Theming the diff surface

`@pierre/diffs` renders into a shadow root, so page CSS cannot reach it. Two
doors are open, and `src/components/diff/diff-view.tsx` uses both:

- Custom properties inherit through the shadow boundary — `src/index.css` sets
  `--diffs-font-family`, `--diffs-font-size`, and friends.
- `options.unsafeCSS` is injected inside the shadow root. It pins
  `--diffs-light-bg` / `--diffs-dark-bg` to the ReUI `--card` token, so the
  diff sits on the same surface as the rest of the UI and the addition and
  deletion tints are mixed against it. It also carries diffshub's
  sticky-header treatment.

## Not carried over from diffshub

The file tree (`@pierre/trees`), GitHub patch loading, comment annotations,
the theme catalog, and the highlighting worker pool. Two pasted texts are one
"file" and small enough to highlight on the main thread. If you paste something
large, wrap the app in `WorkerPoolContextProvider` from `@pierre/diffs/react` —
diffshub's `components/WorkerPoolContext.tsx` is the reference.
