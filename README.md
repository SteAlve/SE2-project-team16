# SE2 Project — Team 16

Repository for the **Software Engineering 2 (SE2)** project, academic year **2026/2027**.

## Repository Structure

The project follows a three-stage branching strategy:

```text
feature/* → dev → qa → main
```

### `main`

Contains the stable and reviewed version of the project.

Changes can only be merged into `main` through a Pull Request from `qa`.

At least **one approval** is required before merging.

### `qa`

Used for testing, integration, and code review before changes reach `main`.

Changes should reach `qa` through a Pull Request from `dev`.

### `dev`

Main development and integration branch.

New features and fixes should be developed in dedicated branches created from `dev`.

Examples:

```text
feature/login
feature/database
fix/authentication
chore/branch-flow
```

Once the work is complete, a Pull Request should be opened toward `dev`.

## Development Workflow

1. Update the local `dev` branch:

```bash
git checkout dev
git pull origin dev
```

2. Create a new branch:

```bash
git checkout -b feature/feature-name
```

3. Develop and commit the changes:

```bash
git add .
git commit -m "feat: description of the change"
```

4. Push the branch:

```bash
git push -u origin feature/feature-name
```

5. Open a Pull Request:

```text
feature/* → dev
```

6. When the development version is ready for testing:

```text
dev → qa
```

7. After testing and review:

```text
qa → main
```

## Branch Protection

Protected branches:

- `main`
- `qa`
- `dev`

Direct pushes and force pushes to protected branches are restricted.

Pull Requests are used to integrate changes and maintain a controlled development workflow.

The expected promotion flow is:

```text
feature/*
    │
    ▼
   dev
    │
    ▼
   qa
    │
    ▼
  main
```

## Commit Convention

Use short and descriptive commit messages.

Recommended prefixes:

```text
feat:     new feature
fix:      bug fix
docs:     documentation changes
test:     tests
refactor: code refactoring
chore:    repository or maintenance changes
ci:       CI/CD configuration changes
```

Examples:

```text
feat: add user authentication
fix: handle invalid login credentials
docs: update README
ci: enforce branch flow
```