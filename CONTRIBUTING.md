# Contributing to PesoFlow

## Branching Strategy

- `main`: always deployable, protected branch.
- Feature branches: `feature/<short-description>`
- Bugfix branches: `fix/<short-description>`
- Hotfix branches: `hotfix/<short-description>`

Examples:

- `feature/journal-analytics-cards`
- `fix/watchlist-remove-error`

## Local Workflow

1. Update `main`

```bash
git checkout main
git pull origin main
```

2. Create a branch

```bash
git checkout -b feature/your-task
```

3. Commit in small logical chunks

```bash
git add .
git commit -m "Add journal month filter popup"
```

4. Push branch and open PR

```bash
git push -u origin feature/your-task
```

## Pull Request Rules

- Open PR into `main`
- At least 1 reviewer approval
- Keep PR focused and small when possible
- Include testing steps and screenshots for UI changes

## Commit Message Style

Use clear action-oriented messages.

- `Add timeframe favorite sorting`
- `Fix marker time ordering assertion`
- `Refactor chart layout for split mode`

## Do Not Commit

- Real secrets (`.env` values)
- Generated local caches (`node_modules`, `.next`, virtual env folders)
- Local database snapshots unless explicitly needed

## Suggested Review Checklist

- Does this break existing flows?
- Are edge cases handled?
- Is the code easy to understand and extend?
- Are docs updated when behavior changes?
