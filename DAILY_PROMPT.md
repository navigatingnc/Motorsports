# Daily Prompt for Motorsports App Development

Use this prompt for your scheduled task to execute the next phase of development.

## Optimized Prompt

```
Project: Motorsports Management Web App

1. **Parse `project_plan.md`**: Identify the first phase with status "Not Started".
2. **Execute**: Complete all tasks for that phase directly on the `main` branch.
3. **Commit**: Commit all changes to the `main` branch with descriptive commit messages.
4. **Log**: Append a new entry to `changelog.md` containing:
   - Phase Number & Title
   - Summary of work
   - All generated code
5. **Update**: In `project_plan.md`, change the completed phase's status to "Done".
6. **Push**: Push the changes directly to the remote `main` branch.
7. **Report**: State the goal of the next phase from `project_plan.md`.
```

## Schedule Configuration

- **Frequency:** Daily at 1:00 AM
- **Repeat:** Indefinitely until all phases complete
- **Task Name:** Motorsports App Daily Build

## Workflow

Each phase follows this simplified Git workflow:

1. Ensure you are on the `main` branch
2. Develop and commit changes directly to `main`
3. Update documentation (changelog, project plan)
4. Push changes directly to the remote `main` branch

## Notes

- Initial setup (Phase 1) was committed directly to `main`
- All subsequent phases now use a direct-to-main workflow to reduce redundancy and accelerate development
- PRs are no longer required for automated phase completions
