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
| Inputs     | CodeMirror 6 via `@uiw/react-codemirror`                   |
| Diff       | `@pierre/diffs` (`FileDiff` from its React entry)          |
| Package    | pnpm                                                      |

## Run

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # typecheck, then production build
pnpm typecheck
pnpm test       # detection cases (vitest)
```

## Screens

- `/` — two CodeMirror panes side by side and a **Compare** button. Each pane
  has line numbers, soft wrapping, and a capped height
  (`min(28rem, 55vh)`) that it scrolls inside, so a long paste cannot push the
  Compare button off screen.
- `/compare` — the diff, with layout, wrapping, syntax, and display controls
  (line numbers, change backgrounds, collapse unchanged, change indicators).

The syntax picker (`src/components/language-select.tsx`) appears on both
screens and reads one persisted selection, so setting it next to the panes and
setting it in the diff toolbar are the same act.

The pair is held in a module store mirrored into `sessionStorage`, so
`/compare` survives a reload. Viewer settings and the color mode persist in
`localStorage`.

## Language detection

The language selection defaults to `auto`, so pasted code highlights on both
screens without touching the picker, and either screen's picker can override
it. `src/lib/detect-language.ts` holds an
ordered set of signals (shebangs, `package main`, a successful `JSON.parse`, a
TypeScript type annotation, and so on) and falls back to plain text rather than
guessing wildly. It is a heuristic, not a parser; either picker always overrides it.

The overlaps are the hard part, and they are covered by
`src/lib/detect-language.test.ts`. YAML is the awkward one: a flow mapping
(`env: { A: 1 }`) reads as a CSS rule and a leading `#` comment reads as a
Markdown heading, so YAML is tested first, using a structural line-ratio check
rather than a pattern. CSS in turn requires a semicolon-terminated declaration
inside braces, which is what keeps flow mappings out of it.

The detected language drives three things at once: Shiki highlighting in the
diff, the CodeMirror grammar in the panes, and the extension on the synthetic
filename in the diff header.

CodeMirror grammars come from `@uiw/codemirror-extensions-langs`, one dependency
covering every language in the picker. It is a ~1.1 MB chunk, so it is imported
dynamically and only fetched once something other than plain text is in play —
it never touches first paint. Swapping it for per-language
`@codemirror/lang-*` imports would cut that to tens of kilobytes per language at
the cost of about fifteen more dependencies.

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
