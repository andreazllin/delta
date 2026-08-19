# delta · a no-bs text diff viewer

Paste two blocks of text and compare them. The result is a real diff: split or
unified, syntax highlighted, with word-level highlights inside a changed line.

This app renders diffs with [`@pierre/diffs`][diffs], the same library
[diffshub][diffshub] uses. diffshub reads files from a repository URL. This app
compares the two texts that you type.

[diffshub]: https://github.com/pierrecomputer/pierre/tree/main/apps/diffshub
[diffs]: https://www.npmjs.com/package/@pierre/diffs

## Stack

| Piece      | Choice                                             |
| ---------- | -------------------------------------------------- |
| Build      | Vite 8 and React 19                                |
| Routing    | TanStack Router (file-based, `src/routes/`)         |
| Styling    | Tailwind CSS v4                                    |
| Components | shadcn `base-vega` style (Base UI) and ReUI         |
| Inputs     | CodeMirror 6 through `@uiw/react-codemirror`        |
| Diff       | `@pierre/diffs` (`FileDiff` from the React entry)   |
| Packages   | pnpm                                               |

## Run

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # typecheck, then build for production
pnpm typecheck
pnpm test       # language detection cases (vitest)
```

## Screens

The `/` route shows two CodeMirror panes and a **Compare** button. Each pane
has line numbers and soft wrapping. Each pane also has a maximum height of
`min(28rem, 55vh)` and scrolls inside it. A long paste therefore cannot push
the Compare button off the screen.

The `/compare` route shows the diff. Its toolbar sets the layout, the wrapping,
the language, and the display options. The display options are the line
numbers, the line highlights, the collapse of unchanged lines, and the diff
markers.

The language control (`src/components/language-select.tsx`) appears on both
screens. Both instances read one saved value. A change on either screen
therefore applies to both.

A module store holds the two texts and copies them into `sessionStorage`. The
`/compare` route survives a reload because of this copy. The viewer options and
the color mode persist in `localStorage`.

## Language detection

The language control defaults to automatic. Pasted code therefore highlights on
both screens without a manual choice. An explicit choice always overrides the
detection.

`src/lib/detect-language.ts` holds an ordered list of signals. The signals
include shebang lines, `package main`, a successful `JSON.parse`, and a
TypeScript type annotation. The detector returns plain text when no signal
matches. It is a heuristic and not a parser.

The overlaps between formats are the difficult part.
`src/lib/detect-language.test.ts` covers them. YAML is the awkward format. A
flow mapping such as `env: { A: 1 }` reads as a CSS rule. A leading `#` comment
reads as a Markdown heading. The detector therefore tests YAML first, and it
counts the lines that carry YAML structure instead of matching one pattern. The
CSS test then requires a declaration inside braces that ends with a semicolon.
This requirement keeps flow mappings out of CSS.

The detected language drives three things at the same time. It selects the Shiki
grammar for the diff. It selects the CodeMirror grammar for the panes. It also
supplies the extension for the filename in the diff header.

`@uiw/codemirror-extensions-langs` supplies the CodeMirror grammars. This single
dependency covers every language in the control. The chunk is about 1.1 MB, so
the app imports it dynamically. The app fetches it only for a language other
than plain text, and it never delays the first paint. Per-language
`@codemirror/lang-*` imports would reduce this cost to tens of kilobytes for
each language. They would also add about fifteen dependencies.

## How the app builds a diff

`src/lib/compute-diff.ts` calls `parseDiffFromFile` from `@pierre/diffs`.
`MultiFileDiff` calls the same function internally. The function builds a
unified patch with jsdiff and then parses it into `FileDiffMetadata`. A diff of
two pasted texts therefore renders exactly like a diff from a real git patch.

Three details matter here:

1. Identical texts produce zero hunks instead of an error. The "texts are
   identical" state checks for this result.
2. The app builds the patch with full context. It does not use the 4-line
   default of jsdiff. A patch omits the lines outside the context, and diffshub
   recovers them with `loadDiffFiles`. This app already holds both texts in
   memory, so it renders every pasted line. **Collapse unchanged lines** in the
   settings menu reduces the context to 4 lines.
3. Both sides share one filename. The cache key that `@pierre/diffs` derives
   for highlight reuse therefore covers the content and the language. A key
   without them renders edited text from a stale cache entry.

The panes have no filename, so the app cannot infer a language from one. The
language control supplies the language, and `src/lib/languages.ts` maps it to
the value that `@pierre/diffs` expects.

## Components

ReUI is a shadcn registry and not a replacement for one. It supplies 21 custom
primitives, such as Alert, Badge, Data Grid, and Tree. It also supplies
component examples. Base primitives such as Button and Textarea come from
shadcn core in the `base-vega` style. The ReUI examples depend on those same
base primitives. The two directories therefore hold different sources:

- `src/components/reui/` holds ReUI primitives. `@reui/badge` draws the diff
  statistics.
- `src/components/ui/` holds shadcn `base-vega` primitives, which use Base UI.

`src/index.css` imports `shadcn/tailwind.css`. That import supplies the custom
variants that the components need, such as `data-open:` and `data-checked:`.
The same file defines the extended ReUI tokens `--success`, `--warning`,
`--info`, `--invert`, and `--focus`.

To install more components:

```bash
pnpm dlx shadcn@latest add textarea          # shadcn core, base-vega style
pnpm dlx shadcn@latest add @reui/alert       # ReUI primitive
pnpm dlx shadcn@latest add @reui/c-alert-1   # ReUI example
```

Premium ReUI items need `REUI_LICENSE_KEY` in `.env.local`. `components.json`
sends this key as a bearer token.

## How to theme the diff surface

`@pierre/diffs` renders into a shadow root, so page CSS cannot reach it. Two
routes into the shadow root remain, and `src/components/diff/diff-view.tsx`
uses both:

- Custom properties inherit through the shadow boundary. `src/index.css` sets
  `--diffs-font-family`, `--diffs-font-size`, and the related properties.
- `options.unsafeCSS` injects CSS inside the shadow root. It sets
  `--diffs-light-bg` and `--diffs-dark-bg` to the ReUI `--card` token. The diff
  then sits on the same surface as the rest of the interface. The library mixes
  the addition and deletion tints against that surface. The same CSS also
  carries the sticky header treatment from diffshub.

## What this app does not take from diffshub

This app omits the file tree (`@pierre/trees`), the GitHub patch loading, the
comment annotations, the theme catalog, and the highlighting worker pool. Two
pasted texts are one file, and one file is small enough to highlight on the
main thread. For very large texts, wrap the app in `WorkerPoolContextProvider`
from `@pierre/diffs/react`. Use `components/WorkerPoolContext.tsx` in diffshub
as the reference.
