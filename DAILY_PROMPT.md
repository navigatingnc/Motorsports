# Daily Prompt for Motorsports App Development

Use this prompt for your scheduled task to execute the next phase of development.

## Optimized Prompt

```
Project: Diamond Apex Collective Web App

1. **Parse `project_plan.md`**: Identify the first phase with status "Not Started".
2. **Create Branch**: Create a new branch named `phase-{number}-{short-description}` (e.g., `phase-2-vehicle-model`).
3. **Execute**: Complete all tasks for that phase.
4. **Commit**: Commit all changes to the feature branch with descriptive commit messages.
5. **Log**: Append a new entry to `changelog.md` containing:
   - Phase Number & Title
   - Summary of work
   - All generated code
6. **Update**: In `project_plan.md`, change the completed phase's status to "Done".
7. **Push & PR**: Push the branch to GitHub and create a pull request with:
   - Title: "Phase {number}: {Phase Title}"
   - Description: Summary of changes from changelog
8. **Auto-Merge**: Immediately merge the PR using `gh pr merge --merge --delete-branch`.
9. **Report**: State the goal of the next phase from `project_plan.md`.
```

## Schedule Configuration

- **Frequency:** Daily at 1:00 AM
- **Repeat:** Indefinitely until all phases complete
- **Task Name:** Motorsports App Daily Build

## Workflow

Each phase follows this Git workflow:

1. Start from `main` branch
2. Create feature branch for the phase
3. Develop and commit changes
4. Update documentation (changelog, project plan)
5. Push branch and open PR
6. Auto-merge PR immediately
7. Feature branch is deleted automatically

## Notes

- Phase 1 was committed directly to `main` (initial setup)
- All subsequent phases (2+) will use the PR workflow
- PRs are automatically merged after creation for continuous progress
