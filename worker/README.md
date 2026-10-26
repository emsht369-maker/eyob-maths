# Math Master AI Tutor

## First setup

1. Open a terminal.
2. Run `cd ~/math-master/worker && bash setup.sh`.
3. Setup publishes the tutor Worker and connects it to the Math Master website.

## Publish the website

From the repository root, run `bash worker/deploy-site.sh`. The build creates
content-hashed JavaScript and CSS files, writes the cache headers and uploads
the site to `https://eyob-maths-site.pages.dev/`. Backups, tests and local audit
files are kept out of the published site.

The script asks for provider keys. Key input is hidden. Keys go straight to
Cloudflare and are not saved in the website. Leave a key
blank to keep its current Cloudflare secret unchanged, so rerunning setup does
not require pasting the keys again.

## Run setup again

Run `cd ~/math-master/worker && bash setup.sh` again. It is safe to repeat.

## Change a key

Run `bash setup.sh` again and paste the new key when asked. Leave the other
provider blank if you do not want to change it. If both are blank, existing
keys are kept; on a first setup, enter at least one provider key.

## View Worker logs

From this folder, run `npx wrangler tail`.

## If the tutor connection fails

Check that `ALLOWED_ORIGIN` in `wrangler.toml` is exactly
`https://eyob-maths-site.pages.dev`, without a page path or trailing slash.
Tests set their own test origin explicitly; the deployed Worker accepts only
the Math Master Pages domain.

Then run `bash setup.sh` again. Check that at least one provider key is set and
use `npx wrangler tail` to see Worker errors.

## Purge cached content after publishing

HTML is served with no-cache headers, and versioned JS/CSS files have
content-hashed filenames. Cloudflare Pages serves the new deployment, and the
browser should revalidate HTML on the next visit. For this site's `pages.dev`
address, first hard-refresh with Ctrl+Shift+R (or Cmd+Shift+R on a Mac).

If the site is later connected to a custom domain and stale content persists,
open the Cloudflare dashboard, select that domain's zone, then go to
**Caching → Configuration → Purge Everything**. The purge control is on the
zone, not in the Pages project's build-cache settings.
