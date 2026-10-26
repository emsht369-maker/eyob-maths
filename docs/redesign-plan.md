# Math Master redesign plan

## Phase 0 audit

The site is a static HTML/CSS/JS project with 25 topic routes under `topic/<slug>/index.html`. Each topic shell is intentionally small: it mounts into `#topic-mount`, then loads the same shared scripts as the home page. The topic lessons are data modules, not independent pages to redesign one by one.

## How a topic page is built

1. `topic/<slug>/index.html` supplies the route, shared stylesheet links, mount point, and script list. `index.html` uses the same `js/app.js` application on the home route.
2. `js/data.js` defines the ordered topic catalogue, topic descriptions, goals, and route metadata. Existing local saves use `mathmaster` and `mathmaster_activity`; `js/app.js` reads and migrates those values.
3. `js/lessons/01.js` through `js/lessons/25.js` populate `L[index]`. Their `s` arrays hold Learn sections, `e` worked examples, `q` practice questions, and `v`/`k` video and link suggestions. The topic index selects the relevant lesson data.
4. `js/app.js` owns the shared home/topic shell and renders the room header, progress, learn panel, learning-goal controls, practice, assessment, challenge, room tabs, and mobile step controls. It also contains topic and answer scoring, badge updates, saved progress, hash routing, and topic unlock behaviour.
5. `js/resources.js`, `js/calculus-resources.js`, and `js/app.js`'s `buildTopicLinkGroups` assemble resource records for the shared `renderResourceGroups` function in `js/links-renderer.js`. That renderer currently emits resource group lists and embeds local PDFs in iframes.
6. `js/imported-content.js`, `js/imported-question-bank.js`, `data/imported-questions.js`, `data/imported-learn.js`, and JSON files under `data/import-staging/` add imported MIT content, source labels, images, answers, and solutions. Imported questions currently have their own markup and interactions.
7. `css/style.css` is the main design system and shared page styling; `css/imported-content.css` styles imported questions. Other CSS files style separate GCSE, rooms, papers, materials, visual lab, and AI surfaces. `css/visual-map.css` and `css/ai.css` also load on topic routes.
8. `js/links.js` and `js/links-renderer.js` support the standalone links/resource page. `js/answer-feedback.js` owns shared feedback UI used by some answer flows. `js/rooms/`, `js/papers/`, and `js/visual/` contain separate room, paper, and visual-practice experiences.

## Requested content source map

| Page content | Source of truth / renderer |
| --- | --- |
| Header and navigation | Static `<nav class="site-menu">` in `index.html` and each topic shell; styled in `css/style.css`. These currently differ in link order and labels. |
| Room header and room steps | `openTopic()` in `js/app.js`; room tabs and hash navigation are in `js/app.js`; bottom step controls are `.topic-flow-controls` markup and CSS. |
| Learn text and worked examples | `L[index].s` and `L[index].e` in `js/lessons/*.js`; rendered in `js/app.js`'s topic renderer. Imported Learn material can come from `data/imported-learn.js` and `js/imported-content.js`. |
| Resource groups | `buildTopicLinkGroups()` in `js/app.js`, common resources in `js/resources.js`, calculus PDF inventory in `js/calculus-resources.js` / `data/calculus-pdf-inventory.json`, and rendering in `js/links-renderer.js`. |
| PDF cards / embedded previews | Resource URL records and imported question source metadata; local PDF previews are currently generated as `<iframe>` by `js/links-renderer.js` and `js/imported-content.js`. |
| Guided, practice, assessment, challenge questions | Lesson arrays (`e`, `q`, assessment/exam data) plus shared markup and event handlers in `js/app.js`. Challenge/room questions also use `js/rooms/engine.js`. |
| Imported question blocks | `data/imported-questions.js` plus `js/imported-content.js`; imported assessment set construction and persistence are split with `js/imported-question-bank.js` and `js/app.js`. |
| Points and badges | `ACTIVITY.points` and `ACTIVITY.badges` in `js/app.js`; award sites include topic quiz completion, hard exam, and practice answer handlers. Room awards also exist in `js/rooms/engine.js`. |

## Constraints and implementation sequence

- Preserve route/hash behaviour and existing save keys. New UI state uses only `mm2-` keys.
- Make changes in shared renderers and shared styles so topic changes apply to all 25 routes.
- Keep lesson wording and mathematical content intact except for presentation and task splitting. Verify any new displayed calculation before adding it.
- Implement the phases in the supplied order: shared visual system; reusable in-page PDF reader; resource cleanup; shared question experience and reward event; Learn task layout; full linear algebra notes mapping; cross-topic QA.
- For Phase 6, inspect the local ZoomNotes and related MIT PDFs and verify the PDF page offsets against the document text before publishing page links.
- For Phase 7, exercise all topic routes at desktop and mobile widths, retain old saves, check reader and question flows, and rerun the full QA after fixes.

## Baseline screenshots

Captured before site edits using Playwright and the installed Chrome browser:

- `docs/redesign-screens/before-home-1280.png`
- `docs/redesign-screens/before-home-360.png`
- `docs/redesign-screens/before-topic-1280.png`
- `docs/redesign-screens/before-topic-360.png`

The topic baseline is Basic Arithmetic. At this audit point, the workspace already contains extensive pre-existing staged, modified, and untracked work. It was left intact; phase commits could not be made because the Git index is read-only.

## Phase 6–7 completion record

The Linear Algebra notes expansion lives in `js/linear-algebra-sections.js` and is rendered by the shared Learn view in `js/app.js`. It covers ZoomNotes 1.1–1.3 and 4.1–4.2 for Vectors, 1.3–1.8, 2.1–2.6 and 5.1–5.4 for Matrices, and the requested 3.x, 4.x, 6.x–9.x sections for Linear Algebra. Section links open the existing ZoomNotes PDF reader on the corresponding PDF page; the full notes file appears first in each topic's resource list.

`scripts/qa-all-topics.js` runs the browser sweep and writes `docs/redesign-screens/qa-all-topics.json`. The final run rendered all 25 topic routes with practice preview enabled, found zero JavaScript errors, mobile overflow, iframe previews, default-visible answers or broken local resource links, and opened the 80-page ZoomNotes reader. Final home, topic-flow, reader, and Linear Algebra desktop/mobile captures are stored in `docs/redesign-screens/`.

Phase commits were attempted with path-limited staging, but the workspace Git index is read-only. Existing staged changes were left intact and no commit was created.
