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

`qa` tests **one batch at a time**. Changes reach `qa` in two ways:

- **A new batch** comes through a Pull Request from `dev`. It can be opened only when everything already in `qa` has been promoted to `main` (the **Qa is promoted to main** check) and `dev` already contains every fix made on `qa` (the **Dev has everything from qa** check).
- **A change to the batch already in `qa`** (a bug, a missing test) comes through a Pull Request from a `fix/*` or `test/*` branch created from `qa`. See [Testing](#testing).

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

6. When the development version is ready for testing, and `qa` has no batch waiting for `main`:

```text
dev → qa
```

7. After testing and review:

```text
qa → main
```

## Local database

From the `server` directory, install dependencies and create the local SQLite database:

```powershell
npm.cmd install
npm.cmd run db:create
```

This creates `server/office-queue.db`. Start the server with:

```powershell
node src/index.js
```

Run `npm.cmd run db:create` again only when setting up a new clone or after deleting the local database file.

To add some sample services and counters, so you can try the app, run this after `db:create`:

```powershell
npm.cmd run db:seed
```

On macOS and Linux, use `npm` instead of `npm.cmd`.

## E2E tests

The E2E tests use Playwright. They start the server and the client by themselves, on a separate test database, so your local one is never touched.

The first time, install everything (from the repository root):

```powershell
cd server; npm.cmd install; cd ..
cd client; npm.cmd install; cd ..
cd e2e; npm.cmd install; npx playwright install chromium
```

Then, from the `e2e` directory:

```powershell
npm.cmd run e2e
```

Ports 3001 and 5173 must be free, so stop your own server and client first. To see a report of the last run, use `npx playwright show-report`.

## Testing

Where a test is written depends on what it covers.

**A new feature.** Write the tests together with the code, in the same feature branch and Pull Request into `dev`.

**The batch already in `qa`.** If testing finds a bug or a missing test, the change is made in `qa`, not in `dev`:

1. Create a branch **from `qa`**, named `fix/...` or `test/...`:

```bash
git checkout qa
git pull origin qa
git checkout -b fix/short-description
```

2. Open a Pull Request **into `qa`** and merge it.
3. Open a Pull Request from `qa` into `dev` (back-merge), so that `dev` receives the same change. Merge it with **Create a merge commit**, not squash or rebase: the **Dev has everything from qa** check recognizes the fix only that way, and it stays red until the back-merge is done.
4. When `qa` is verified, promote it: `qa → main`.

Only then the next batch can move on: `dev → qa`.

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
