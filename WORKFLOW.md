# Development Workflow

This document describes the Git workflow for the motorsports management web app development.

## Branch Strategy

### Main Branch
- **Branch:** `main`
- **Purpose:** Primary branch for all development phases. Automated updates are pushed directly here to maintain continuous progress.

### Feature Branches (Optional)
- **Purpose:** May be used for complex manual features or experimental work.
- **Naming:** `feature/{description}`
- **Lifecycle:** Created as needed, merged via PR to `main`.

## Development Process

### For Each Phase

1. **Start Fresh**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Develop & Commit**
   ```bash
   git add .
   git commit -m "Phase {number}: {Description}"
   ```
   - Make atomic commits with clear messages
   - Commit frequently as you complete sub-tasks

3. **Update Documentation**
   - Update `changelog.md` with phase summary and code
   - Update `project_plan.md` to mark phase as "Done"
   - Commit documentation changes

4. **Push to Main**
   ```bash
   git push origin main
   ```
   - Changes are pushed directly to the main branch
   - Process is fully automated and streamlined

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
2. Executes all development tasks on the `main` branch
3. Commits changes with proper messages
4. Updates documentation (changelog, project plan)
5. Pushes changes directly to `main`
6. Reports completion

**Fully automated** - No manual intervention required. Each morning, a new phase is completed and pushed to main.

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

### If Commit Has Conflicts
```bash
git checkout main
git fetch origin
git rebase origin/main
# Resolve conflicts
git push
```

### If Need to Revert Phase
```bash
git checkout main
git revert HEAD # Or specific commit hash
git push origin main
```

### If Need to Redo Phase
1. Revert the changes in `main` if already pushed
2. Mark phase as "Not Started" in `project_plan.md`
3. Re-run the scheduled task
