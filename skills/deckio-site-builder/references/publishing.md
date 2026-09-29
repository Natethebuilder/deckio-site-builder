# Publishing to GitHub Pages

The template includes `.github/workflows/deploy.yml`. It builds with Node 20 and deploys `dist/` to Pages on every push to `main`, and it can also be run manually.

```powershell
cd <site-folder>
git init -b main
git add -A
git commit -m "Initial site and deck" -m "Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>"

gh repo create <owner>/<id> --public --source . --push      # <id> must equal vite base path
gh api -X POST repos/<owner>/<id>/pages -f build_type=workflow
gh workflow run deploy.yml --repo <owner>/<id>
gh run list --repo <owner>/<id> --workflow deploy.yml --limit 1   # get the run id
gh run watch <run-id> --repo <owner>/<id> --exit-status
```

The live URL is `https://<owner>.github.io/<id>/`, and the deck is at `https://<owner>.github.io/<id>/#/deck`.

Notes:
- The first push-triggered run can fail or be cancelled because Pages was not enabled yet. That is why the steps enable Pages and then dispatch the workflow again.
- A 404 on assets means `base` in `vite.config.js` does not match the repo name.
- Pages from a private repo needs GitHub Pro, Team or Enterprise. For an org repo, check that Pages is allowed in the org settings.
- The site is public, so don't put internal notes, names or unreleased customer details on it without the user's explicit OK.
- After deploying, run `node <SKILL_DIR>/scripts/verify.mjs --url https://<owner>.github.io/<id>/ --quick` to confirm the live build.
- Updates: commit and push to `main`, and the workflow redeploys.
