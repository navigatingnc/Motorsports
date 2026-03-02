# GitHub Actions Workflows — Staging

This directory contains the three GitHub Actions workflow files for Phase 18 (CI/CD).
They are staged here because the current GitHub App integration token does not have
the `workflows` permission required to write directly to `.github/workflows/`.

## To Activate

Move these files to `.github/workflows/` using one of the following methods:

### Option A — Via GitHub UI
1. Navigate to each file in this directory on GitHub.
2. Click the pencil (edit) icon.
3. Change the path from `docs/workflows-staging/<file>.yml` to `.github/workflows/<file>.yml`.
4. Commit the change.

### Option B — Via CLI with a PAT
```bash
# Create a PAT with repo + workflow scopes at https://github.com/settings/tokens
export GITHUB_TOKEN=<your-pat>

git checkout -b activate-workflows
mkdir -p .github/workflows
cp docs/workflows-staging/*.yml .github/workflows/
git add .github/workflows/
git commit -m "feat(ci): activate GitHub Actions workflows"
git push origin activate-workflows
gh pr create --title "Activate CI/CD Workflows" --body "Move workflow files from staging to .github/workflows/"
gh pr merge --merge --delete-branch
```

### Option C — Grant Manus the workflows permission
1. Go to **Settings → Integrations → GitHub Apps** in this repository.
2. Find the Manus app and click **Configure**.
3. Under **Repository permissions**, set **Workflows** to **Read and write**.
4. Re-run the Phase 18 task — Manus will push the files automatically.

## Workflow Files

| File | Purpose |
| :--- | :--- |
| `ci.yml` | Lint and build backend + frontend on every push and PR |
| `docker-publish.yml` | Build and push multi-arch Docker images to GHCR on merge to `main` |
| `release.yml` | Semantic versioning and GitHub Release creation |
