# Daily Prompt for Motorsports App Development

Use this prompt for your scheduled task to execute the next phase of development.

## Optimized Prompt

```
Project: Motorsports Management Web App

1. **Parse `project_plan.md`**: Identify the first phase with status "Not Started".

2. **If a "Not Started" phase exists — Execute it:**
   - Complete all tasks for that phase directly on the `main` branch.
   - Commit all changes with descriptive commit messages.
   - Append a new entry to `changelog.md` containing:
     - Phase Number & Title
     - Summary of work
     - All generated code
   - In `project_plan.md`, change the completed phase's status to "Done".
   - Push the changes directly to the remote `main` branch.
   - State the goal of the next phase from `project_plan.md`.

3. **If NO "Not Started" phase exists — Self-Extend:**
   - Review the existing codebase, `changelog.md`, and completed phases to identify the single most valuable next enhancement.
   - The enhancement **must** meet all three of the following criteria:
     1. **Measurable impact** — the improvement can be verified before and after (e.g. a user can now complete a task they couldn't before, a page load is faster, an error is handled gracefully, a missing field is now present).
     2. **Functionality or UX first** — prioritize in this order: (a) missing core features a real user would notice or be blocked by, (b) broken or incomplete UX flows, (c) performance and reliability improvements, (d) developer tooling or refactors. Do NOT add phases that are purely cosmetic, speculative, or unlikely to be used.
     3. **Scoped and shippable** — the phase should be completable in a single session and produce a working, testable result. Avoid vague or overly broad phases.
   - Before committing, write a one-sentence justification inside the phase description explaining what is measurably better after this phase ships (e.g. "Users can now filter events by date, reducing time to find relevant setups.").
   - Add a new phase entry to `project_plan.md` with status "Not Started", following the same format as existing phases (incrementing the phase number).
   - Commit the updated `project_plan.md` with message: "Chore: Add Phase {number} to project plan".
   - Push the change to the remote `main` branch.
   - Then immediately execute Step 1 again to begin that new phase in the same session.
```

## Schedule Configuration

- **Frequency:** Daily at 1:00 AM
- **Repeat:** Indefinitely — the self-extension step ensures there is always a next phase
- **Task Name:** Motorsports App Daily Build

## Workflow

Each phase follows this simplified Git workflow:

1. Ensure you are on the `main` branch
2. Develop and commit changes directly to `main`
3. Update documentation (changelog, project plan)
4. Push changes directly to the remote `main` branch

## Notes

- Initial setup (Phase 1) was committed directly to `main`
- All subsequent phases use a direct-to-main workflow to reduce redundancy and accelerate development
- PRs are no longer required for automated phase completions
- When self-extending, prioritize features listed in `README.md` under "Features (In Progress / Evolving Daily)" before inventing new ones, but only if they meet the measurability and UX criteria above
- Never add a phase for something that cannot be tested or verified by a real user interacting with the app
