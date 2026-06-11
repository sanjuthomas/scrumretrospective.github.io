# Releasing to production

Production deploys are **versioned**. Pushing to `main` runs tests only; the live site and Railway sync API update when you push a **semver git tag**.

## Day-to-day development

1. Open a branch and make changes.
2. Open a **pull request** into `main` (direct commits to `main` are blocked).
3. Wait for CI: **Unit tests** and **Integration tests (local sync API)** must pass.
4. Merge the PR.

Nothing is deployed to production until you cut a release tag.

## Cut a release

1. Ensure `main` has everything you want in production (merged via PR).
2. Bump the version in `package.json` if needed (semver: `MAJOR.MINOR.PATCH`).
3. Commit the version bump on `main` (via PR), or include it in the release PR.
4. Create and push an annotated tag matching the version:

```bash
git checkout main
git pull
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

5. GitHub Actions runs:
   - **Deploy to GitHub Pages** — tests, build with `VITE_APP_VERSION` set to the tag, deploy static UI.
   - **Deploy sync API to Railway** — deploys `server/` (when Railway secrets are configured).

The site footer shows the deployed tag (e.g. `v1.0.0`) and links to the GitHub release/tag page.

## Manual deploy (emergency)

Actions → **Deploy to GitHub Pages** → **Run workflow**. Enter the version label for the footer. Prefer tag-based releases for traceability.

## Branch protection

`main` requires pull requests and passing status checks:

- Require a pull request before merging
- Require status checks: `Unit tests`, `Integration tests (local sync API)`

## GitHub Pages environment

The **github-pages** deployment environment must allow `v*` tags (not only `main`). In **Settings → Environments → github-pages → Deployment branches and tags**, include a tag rule `v*`. Without this, tag-triggered deploys are rejected.
