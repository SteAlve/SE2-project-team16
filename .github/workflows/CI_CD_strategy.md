# SE2 Project — CI/CD Strategy

## Overview

The project follows the following branch strategy:

```text
feature/* → dev → qa → main
```

The CI/CD strategy is designed to support this workflow by automatically checking the code, validating Pull Requests, testing the integrated application, and deploying validated versions.

The main objectives are:

- Automatically verify code changes.
- Prevent broken code from being merged.
- Ensure that Pull Requests follow the defined branch flow.
- Provide a dedicated QA environment for testing.
- Automate the deployment of stable versions.
- Reduce manual errors during integration and deployment.

The CI/CD system will be implemented using **GitHub Actions**.

---

# Continuous Integration on Feature Branches

When a developer completes a feature or fix, a Pull Request is opened from a dedicated branch toward `dev`.

```text
feature/*
     │
     │ Pull Request
     ▼
    dev
```

Every time a Pull Request is opened or updated, GitHub Actions should automatically run a CI pipeline.

The pipeline should perform the following operations:

```text
Pull Request
     │
     ▼
Install dependencies
     │
     ▼
Lint
     │
     ▼
Unit tests
     │
     ▼
Build
     │
     ▼
✓ CI passed
```

The purpose of this pipeline is to verify that the proposed changes do not introduce problems before they are integrated into `dev`.

The main checks are:

- Install project dependencies.
- Run the linter.
- Execute unit tests.
- Build the application, when a build process is available.
- Verify that the project can be successfully compiled or built.

If one of the required checks fails, the Pull Request should not be allowed to merge.

---

# Continuous Integration on `dev`

The `dev` branch is the main development and integration branch.

When a Pull Request is merged from a feature branch into `dev`, the project should undergo a more complete validation process.

```text
feature/*
     │
     │ Pull Request
     ▼
    dev
     │
     ▼
 Integration CI
```

The CI pipeline on `dev` should include:

```text
Checkout
   ↓
Install dependencies
   ↓
Lint
   ↓
Unit tests
   ↓
Integration tests
   ↓
Build
```

The main difference compared with the feature-branch validation is the introduction of **integration tests**.

Integration tests are particularly important on `dev` because this branch contains changes from multiple development branches and therefore represents an integrated version of the application.

The objective is to verify not only that individual components work correctly, but also that they work correctly together.

---

# QA Pipeline

The `qa` branch represents a version of the application that is ready for testing.

The expected promotion is:

```text
dev
 │
 │ Pull Request
 ▼
qa
```

When changes are promoted from `dev` to `qa`, GitHub Actions should perform a complete validation and deploy the resulting version to the QA environment.

The pipeline should follow this structure:

```text
Build
  ↓
Unit tests
  ↓
Integration tests
  ↓
E2E tests
  ↓
Generate artifact
  ↓
Deploy to QA environment
```

The QA pipeline should therefore:

- Build the application.
- Run unit tests.
- Run integration tests.
- Run end-to-end tests.
- Generate the application artifact.
- Deploy the validated version to the QA environment.

The QA environment allows the team to test the application in an environment separate from the development environment.

This provides a controlled stage where the team can verify the behavior of the application before promoting it to `main`.

---

# Continuous Delivery / Deployment for `main`

The `main` branch contains the stable version of the project.

The expected promotion is:

```text
qa
 │
 │ Pull Request
 ▼
main
```

After the Pull Request is merged into `main`, the final CI/CD pipeline should validate and deploy the application.

The pipeline should follow this structure:

```text
Checkout
   ↓
Install dependencies
   ↓
Lint
   ↓
Tests
   ↓
Build
   ↓
Deploy to production
```

The final deployment should only take place after all required checks have successfully completed.

The resulting workflow is:

```text
qa
 │
 │ Pull Request
 ▼
main
 │
 │ Merge
 ▼
CI/CD
 │
 ├── Tests
 ├── Build
 └── Deploy
        │
        ▼
   Production
```

For this academic project, the production environment could correspond to the platform used to host the application, such as Render, if this is the deployment platform selected by the team.

---

# Branch Protection

Branch protection is an essential part of the CI/CD strategy. It prevents direct changes to the protected branches and ensures that Pull Requests follow the defined branch flow.

The protected branches are:

```text
dev
qa
main
```

Direct pushes and force pushes should be restricted on all protected branches.

## `dev`

The `dev` branch is the integration branch for new features and development work.

The following rules should be applied:

- Direct pushes disabled.
- Force pushes disabled.
- Pull Request required.
- Required CI checks must pass before merging.

```text
feature/*
     │
     │ Pull Request
     ▼
    dev
     │
     └── CI must pass
```

## `qa`

The `qa` branch contains the batch currently being tested.

The following rules should be applied:

- Direct pushes disabled.
- Force pushes disabled.
- Pull Request required.
- Required CI checks must pass before merging.
- At least one approval may be required.

The allowed Pull Requests are:

```text
dev ──────────> qa     (new batch)
fix/* ────────> qa     (fix current batch)
test/* ───────> qa     (test current batch)
```

In addition, the `branch-flow.yml` workflow ensures that:

- A new `dev → qa` batch can enter `qa` only after the previous batch has been promoted to `main`.
- Fixes made during QA are back-merged into `dev` before the next batch is promoted.

```text
             ┌── fix/* ──┐
             │           │
dev ─────────┼──────────> qa
             │           │
             └─ test/* ──┘
                         │
                         │ Pull Request
                         ▼
                        main
```

## `main`

The `main` branch contains the stable version of the project.

The following rules should be applied:

- Direct pushes disabled.
- Force pushes disabled.
- Pull Request required.
- Only `qa` can be merged into `main`.
- At least one approval required.
- Required CI checks must pass before merging.

```text
qa
 │
 │ Pull Request
 ▼
main
 │
 ├── 1 approval required
 ├── CI must pass
 └── Only qa can be merged
```

These rules, together with the `branch-flow.yml` workflow, ensure that the defined branch strategy cannot easily be bypassed.

---

# GitHub Actions

The CI/CD system will be implemented using GitHub Actions.

The workflows can be organized as follows:

```text
.github/
└── workflows/
    ├── branch-flow.yml
    ├── ci.yml
    ├── integration.yml
    ├── qa.yml
    └── deploy.yml
```

Each workflow has a specific responsibility.

### `branch-flow.yml`

Validates that Pull Requests follow the defined branch promotion strategy:

```text
feature/* → dev → qa → main
```

### `ci.yml`

Performs the basic Continuous Integration checks for Pull Requests targeting `dev`.

Typical checks include:

- Dependency installation.
- Linting.
- Unit tests.
- Build.

### `integration.yml`

Performs more extensive validation on the integrated `dev` branch.

Typical checks include:

- Linting.
- Unit tests.
- Integration tests.
- Build.

### `qa.yml`

Validates and deploys the application to the QA environment.

Typical steps include:

- Build.
- Unit tests.
- Integration tests.
- End-to-end tests.
- Artifact generation.
- QA deployment.

### `deploy.yml`

Handles the final deployment after changes reach `main`.

Typical steps include:

- Install dependencies.
- Lint.
- Tests.
- Build.
- Production deployment.

---