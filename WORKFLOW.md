# Development Workflow

This document describes the Git workflow for the Diamond Apex Collective web app development.

## Branch Strategy

### Main Branch
- **Branch:** `main`
- **Purpose:** Production-ready code
- **Protection:** All changes must come through pull requests (except initial setup)

### Feature Branches
- **Naming:** `phase-{number}-{short-description}`
- **Examples:**
  - `phase-2-vehicle-model`
  - `phase-3-frontend-setup`
  - `phase-4-event-model`
- **Lifecycle:** Created for each phase, merged via PR, then deleted after merge

## Development Process

### For Each Phase

1. **Start Fresh**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b phase-{number}-{description}
   ```

3. **Develop & Commit**
   ```bash
   git add .
   git commit -m "Descriptive message"
   ```
   - Make atomic commits with clear messages
   - Commit frequently as you complete sub-tasks

4. **Update Documentation**
   - Update `changelog.md` with phase summary and code
   - Update `project_plan.md` to mark phase as "Done"
   - Commit documentation changes

5. **Push & Create PR**
   ```bash
   git push origin phase-{number}-{description}
   gh pr create --title "Phase {number}: {Title}" --body "{Summary}"
   ```

6. **Review & Merge**
   - Review the PR on GitHub
   - Check all changes are correct
   - Merge when ready (manual step)
   - Delete the feature branch after merge

## Pull Request Template

**Title Format:** `Phase {number}: {Phase Title}`

**Description Should Include:**
- Summary of what was built
- Key files added/modified
- Testing notes (if applicable)
- Link to changelog entry
- Next phase preview

**Example:**
```
## Phase 2: Vehicle Model & API

### Summary
Implemented the Vehicle model in Prisma and created full CRUD API endpoints.

### Changes
- Added Vehicle model to `prisma/schema.prisma`
- Created vehicle controller with CRUD logic
- Implemented `/api/vehicles` REST endpoints
- Added validation middleware

### Files Added
- `src/controllers/vehicle.controller.ts`
- `src/routes/vehicle.routes.ts`
- `src/middleware/validation.ts`

### Testing
All endpoints tested manually with curl:
- GET /api/vehicles - Returns all vehicles
- POST /api/vehicles - Creates new vehicle
- GET /api/vehicles/:id - Returns single vehicle
- PUT /api/vehicles/:id - Updates vehicle
- DELETE /api/vehicles/:id - Deletes vehicle

### Next Phase
Phase 3 will set up the React frontend with Vite and TypeScript.
```

## Automated Daily Build

The scheduled task automatically:
1. Identifies the next "Not Started" phase
2. Creates a feature branch
3. Executes all development tasks
4. Commits changes with proper messages
5. Updates documentation
6. Pushes branch and opens PR
7. Reports completion

**You manually:**
- Review the PR
- Test if needed
- Merge the PR
- Delete the branch

## Best Practices

### Commit Messages
- Use present tense: "Add vehicle model" not "Added vehicle model"
- Be specific: "Add vehicle CRUD endpoints" not "Update backend"
- Reference phase: "Phase 2: Add vehicle model to schema"

### Branch Management
- Keep branches short-lived (one phase = one branch)
- Delete branches after merging
- Always branch from latest `main`

### Code Review
- Check for TypeScript errors
- Verify all files are included
- Review changelog accuracy
- Ensure documentation is updated

## Emergency Procedures

### If PR Has Conflicts
```bash
git checkout phase-{number}-{description}
git fetch origin
git rebase origin/main
# Resolve conflicts
git push --force-with-lease
```

### If Need to Abandon Phase
```bash
git checkout main
gh pr close {pr-number}
git branch -D phase-{number}-{description}
```

### If Need to Redo Phase
1. Close the PR
2. Delete the branch locally and remotely
3. Mark phase as "Not Started" in `project_plan.md`
4. Re-run the scheduled task
