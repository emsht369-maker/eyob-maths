# Math Master

Math Master is a maths learning site with GCSE topics, practice questions,
step-by-step lessons, visual explanations, study rooms, practice papers, and an
AI tutor.

## Live site

https://eyob-maths-site.pages.dev/

The older GitHub Pages copy is at
https://emsht369-maker.github.io/eyob-maths/.

## Run locally

From the repository root, run:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

Each topic has a full-page route at `/topic/<slug>` (for example,
`/topic/basic-arithmetic`). The Cloudflare Pages build exports each topic page,
rewrites known topic URLs to its HTML file, and uses the real 404 page for
unknown slugs.

## AI tutor

The Worker is configured in `js/ai/config.js`. It uses the Cloudflare Worker
deployed from `worker/`. Avoid entering personal information into the tutor.

To redeploy the Worker, run `bash worker/setup.sh` from the repository root.
To publish the website, run `bash worker/deploy-site.sh`.
