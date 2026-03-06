# Phase 18: DevOps: CI/CD with GitHub Actions

**Date:** March 2, 2026  
**Status:** ✅ Completed

---

### Summary
Implemented a complete CI/CD pipeline using GitHub Actions with three purpose-built workflows. The pipeline provides automated quality gates on every push and pull request, multi-architecture Docker image publishing to GitHub Container Registry (GHCR) on every merge to `main`, and a semantic versioning release workflow with auto-generated changelogs. The setup follows security best practices by using `GITHUB_TOKEN` for GHCR authentication and a dedicated `RELEASE_TOKEN` secret for tag creation, eliminating the need for long-lived personal access tokens in most scenarios.

### Work Performed

1. **CI Workflow (`ci.yml`)**
   - Triggers on every push and pull request to any branch
   - Runs two parallel jobs: `backend` and `frontend`
   - Backend job: enables pnpm via corepack, installs dependencies with `--frozen-lockfile`, generates Prisma Client, then runs `tsc` compilation
   - Frontend job: enables pnpm via corepack, installs dependencies, then runs `vite build` (which includes TypeScript type-checking)
   - Both jobs use `actions/cache` keyed on the respective `pnpm-lock.yaml` for fast dependency restoration
   - Uses `concurrency` groups with `cancel-in-progress: true` to avoid redundant runs on rapid pushes

2. **Docker Publish Workflow (`docker-publish.yml`)**
   - Triggers exclusively on pushes to `main` (i.e., after PR merges)
   - Runs two parallel jobs: `build-backend` and `build-frontend`
   - Uses `docker/setup-qemu-action` and `docker/setup-buildx-action` to enable multi-platform builds
   - Builds and pushes `linux/amd64` and `linux/arm64` images for both services
   - Images are tagged with `latest`, a short SHA (`sha-<hash>`), and semver tags when applicable
   - Uses GitHub Actions cache (`type=gha`) for Docker layer caching to accelerate subsequent builds
   - Authenticates to GHCR using the built-in `GITHUB_TOKEN` (no additional secrets required)
   - Frontend build accepts `VITE_API_BASE_URL` as a build argument sourced from repository variables

3. **Release Workflow (`release.yml`)**
   - Supports two trigger modes: automatic (on semver tag push `v*.*.*`) and manual (`workflow_dispatch` with `patch`/`minor`/`major` bump selection)
   - Manual dispatch computes the next version from the latest existing tag, creates and pushes the new tag automatically
   - Generates structured release notes from conventional commit history, categorized into Features, Bug Fixes, and Other Changes
   - Creates a formal GitHub Release with the generated notes using `softprops/action-gh-release@v2`
   - Includes a full changelog link pointing to the diff between the previous and new tags

### Code Generated

#### `.github/workflows/ci.yml`
```yaml
# =============================================================================
# CI Workflow — Lint & Build
#
# Triggers on every push and pull request to any branch.
# Runs two parallel jobs:
#   • backend  — TypeScript type-check + build
#   • frontend — TypeScript type-check + Vite build
# =============================================================================
name: CI

on:
  push:
    branches: ["**"]
  pull_request:
    branches: ["**"]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  backend:
    name: Backend — Type-check & Build
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
      - name: Enable pnpm via corepack
        run: corepack enable && corepack prepare pnpm@latest --activate
      - name: Cache pnpm store
        uses: actions/cache@v4
        with:
          path: ~/.pnpm-store
          key: pnpm-backend-${{ hashFiles('backend/pnpm-lock.yaml') }}
          restore-keys: pnpm-backend-
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Generate Prisma Client
        run: pnpm prisma:generate
      - name: Type-check & compile
        run: pnpm build

  frontend:
    name: Frontend — Type-check & Build
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
      - name: Enable pnpm via corepack
        run: corepack enable && corepack prepare pnpm@latest --activate
      - name: Cache pnpm store
        uses: actions/cache@v4
        with:
          path: ~/.pnpm-store
          key: pnpm-frontend-${{ hashFiles('frontend/pnpm-lock.yaml') }}
          restore-keys: pnpm-frontend-
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Type-check & build
        run: pnpm build
```

#### `.github/workflows/docker-publish.yml`
```yaml
# =============================================================================
# Docker Publish Workflow — Build & Push Multi-Arch Images to GHCR
#
# Triggers on every push to `main` (i.e., after a PR is merged).
# Builds linux/amd64 and linux/arm64 images for both backend and frontend,
# then pushes them to GitHub Container Registry (ghcr.io).
# =============================================================================
name: Docker Publish

on:
  push:
    branches:
      - main

concurrency:
  group: docker-publish-${{ github.sha }}
  cancel-in-progress: false

env:
  REGISTRY: ghcr.io
  OWNER: ${{ github.repository_owner }}

jobs:
  build-backend:
    name: Build & Push Backend Image
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Extract Docker metadata
        id: meta-backend
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.OWNER }}/motorsports-backend
          tags: |
            type=sha,prefix=sha-
            type=raw,value=latest,enable={{is_default_branch}}
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
      - name: Build and push backend image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          file: ./backend/Dockerfile
          target: production
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta-backend.outputs.tags }}
          labels: ${{ steps.meta-backend.outputs.labels }}
          cache-from: type=gha,scope=backend
          cache-to: type=gha,mode=max,scope=backend

  build-frontend:
    name: Build & Push Frontend Image
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Extract Docker metadata
        id: meta-frontend
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.OWNER }}/motorsports-frontend
          tags: |
            type=sha,prefix=sha-
            type=raw,value=latest,enable={{is_default_branch}}
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
      - name: Build and push frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          file: ./frontend/Dockerfile
          target: production
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta-frontend.outputs.tags }}
          labels: ${{ steps.meta-frontend.outputs.labels }}
          build-args: |
            VITE_API_BASE_URL=${{ vars.VITE_API_BASE_URL || 'http://localhost:3000' }}
          cache-from: type=gha,scope=frontend
          cache-to: type=gha,mode=max,scope=frontend
```

#### `.github/workflows/release.yml`
```yaml
# =============================================================================
# Release Workflow — Semantic Versioning & GitHub Release Creation
#
# Triggers manually via workflow_dispatch, or automatically when a tag
# matching v*.*.* is pushed to the repository.
# =============================================================================
name: Release

on:
  push:
    tags:
      - "v[0-9]+.[0-9]+.[0-9]+"
  workflow_dispatch:
    inputs:
      bump:
        description: "Version bump type"
        required: true
        default: "patch"
        type: choice
        options:
          - patch
          - minor
          - major

jobs:
  release:
    name: Create GitHub Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
      packages: read
    steps:
      - name: Checkout repository (full history for changelog)
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.RELEASE_TOKEN || secrets.GITHUB_TOKEN }}

      - name: Set up Node.js
        if: github.event_name == 'workflow_dispatch'
        uses: actions/setup-node@v4
        with:
          node-version: "22"

      - name: Compute next version and create tag (manual dispatch)
        if: github.event_name == 'workflow_dispatch'
        id: bump
        run: |
          LATEST=$(git tag --sort=-v:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | head -1 || echo "v0.0.0")
          VERSION=${LATEST#v}
          MAJOR=$(echo $VERSION | cut -d. -f1)
          MINOR=$(echo $VERSION | cut -d. -f2)
          PATCH=$(echo $VERSION | cut -d. -f3)
          BUMP="${{ github.event.inputs.bump }}"
          if [ "$BUMP" = "major" ]; then
            MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0
          elif [ "$BUMP" = "minor" ]; then
            MINOR=$((MINOR + 1)); PATCH=0
          else
            PATCH=$((PATCH + 1))
          fi
          NEW_TAG="v${MAJOR}.${MINOR}.${PATCH}"
          echo "new_tag=$NEW_TAG" >> "$GITHUB_OUTPUT"
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git tag "$NEW_TAG"
          git push origin "$NEW_TAG"

      - name: Resolve release tag
        id: tag
        run: |
          if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
            echo "tag=${{ steps.bump.outputs.new_tag }}" >> "$GITHUB_OUTPUT"
          else
            echo "tag=${{ github.ref_name }}" >> "$GITHUB_OUTPUT"
          fi

      - name: Generate release notes
        id: notes
        run: |
          TAG="${{ steps.tag.outputs.tag }}"
          PREV=$(git tag --sort=-v:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sed -n '2p' || echo "")
          if [ -n "$PREV" ]; then RANGE="${PREV}..${TAG}"; else RANGE="${TAG}"; fi
          echo "## What's Changed" > release_notes.md
          FEATURES=$(git log $RANGE --pretty=format:"- %s (%h)" --no-merges | grep -iE "^- feat" || true)
          if [ -n "$FEATURES" ]; then echo "### Features" >> release_notes.md; echo "$FEATURES" >> release_notes.md; fi
          FIXES=$(git log $RANGE --pretty=format:"- %s (%h)" --no-merges | grep -iE "^- fix" || true)
          if [ -n "$FIXES" ]; then echo "### Bug Fixes" >> release_notes.md; echo "$FIXES" >> release_notes.md; fi
          OTHERS=$(git log $RANGE --pretty=format:"- %s (%h)" --no-merges | grep -ivE "^- (feat|fix)" || true)
          if [ -n "$OTHERS" ]; then echo "### Other Changes" >> release_notes.md; echo "$OTHERS" >> release_notes.md; fi
          echo "**Full Changelog**: https://github.com/${{ github.repository }}/compare/${PREV}...${TAG}" >> release_notes.md

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ steps.tag.outputs.tag }}
          name: "Release ${{ steps.tag.outputs.tag }}"
          body_path: release_notes.md
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Repository Secrets Required

| Secret / Variable | Scope | Purpose |
| :--- | :--- | :--- |
| `GITHUB_TOKEN` | Built-in | GHCR login for Docker publish; GitHub Release creation |
| `RELEASE_TOKEN` | Optional PAT | Tag creation in `release.yml` when branch protection prevents `GITHUB_TOKEN` from pushing tags |
| `VITE_API_BASE_URL` | Repository variable | Frontend build-arg for production API base URL |

### Next Phase Preview
Phase 19 will install and configure Jest, Supertest, and a Prisma test-database utility to establish a comprehensive backend testing suite covering unit and integration tests for all major API controllers.

---
