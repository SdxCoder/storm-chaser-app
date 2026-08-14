# Storm Chaser Repository Guidance

## Project Goal

Build a reliable iOS and Android Storm Chaser assessment app within the 24-hour limit. Prioritize complete required functionality, failure handling, maintainability, testing, and reviewer setup over visual complexity or feature count.

The detailed source of truth is `docs/Storm-Chaser-Architecture-and-Implementation-Plan.md`. Read the relevant milestone before architecture-sensitive work. Implement only the milestone authorized by the current prompt.

## Locked Stack

- React Native with Expo and TypeScript strict mode
- Expo Router
- Open-Meteo
- TanStack Query
- React Hook Form
- Expo SQLite
- Expo FileSystem
- Expo Image Picker system-camera flow
- Expo Location
- React Native primitives and `StyleSheet`
- Jest and React Native Testing Library

Do not replace a locked choice without first reporting a concrete compatibility or platform blocker.

## Project Structure

- Keep Expo Router routes thin in `app/`.
- Put application provider composition in `src/app/providers/`.
- Put weather code in `src/features/weather/`.
- Put capture, saved-storm list, and storm-detail code in `src/features/storms/`.
- Use necessary non-empty feature subdirectories such as `api`, `components`, `data`, `hooks`, `model`, and `screens`.
- Put database initialization/migrations, location, and durable photo storage in `src/services/`.
- Put only genuinely reused UI in `src/components/`.
- Put semantic colours, spacing, typography, and theme helpers in `src/theme/`.
- Do not create empty or speculative folders.

## Architecture Boundaries

- Routes compose or render feature screens; they do not contain business, API, permission, or persistence logic.
- Keep API transport types separate from domain models and map between them at the boundary.
- Keep SQLite rows separate from domain models and map between them in the data layer.
- TanStack Query owns remote weather state and async query invalidation.
- React Hook Form owns storm metadata form state.
- SQLite owns structured storm records and persisted weather cache.
- FileSystem owns durable photo files; SQLite stores their URIs, never base64 or image bytes.
- Location, camera, filesystem, database, and API failures must not leak raw exceptions into UI.
- Weather must not depend on storms. Storms may consume the public weather hook/model to create an immutable weather snapshot.
- Shared and service modules must not import feature screens or components.
- Keep state local unless multiple independent consumers demonstrate a real sharing need.

## Naming and TypeScript

- Use kebab-case filenames and directory names.
- Use PascalCase for components, classes, enums, and exported model types.
- Use camelCase for functions, variables, fields, and hook names.
- Prefix hooks with `use`.
- Use named exports except where Expo Router requires a default route export.
- Keep strict TypeScript enabled.
- Do not use `any`; use `unknown` at untrusted boundaries and narrow it safely.
- Model nullability explicitly.
- Use controlled unions/enums for finite domain values such as storm classification.
- Prefer small pure mapping and validation functions over inline transformations in screens.
- Avoid non-null assertions unless the invariant is locally proven.
- Do not add barrel files solely to shorten imports; import from the owning module directly.

## UI and Accessibility

- Use React Native primitives and `StyleSheet`; do not add a UI framework.
- Use semantic theme tokens rather than raw light-only colours in feature components.
- Support the system light and dark colour schemes.
- Handle safe areas, keyboard interaction, press states, and disabled/loading states.
- Provide meaningful accessibility labels and roles, adequate touch targets, readable contrast, and field-associated validation messages.
- Extract shared components only after genuine reuse; do not wrap every React Native primitive.

## Error and Offline Rules

- Model loading, empty, not-found, permission-denied, offline, cached, and recoverable-error states distinctly.
- Camera cancellation is a normal outcome, not an error.
- Do not repeatedly request a permission after denial; provide retry or Settings guidance where appropriate.
- Prevent duplicate Save submissions and preserve form data after recoverable failure.
- Copy captured photos into app-owned durable storage before persisting their URI.
- Clean up an orphaned copied photo if the database insert fails.
- Store an immutable weather snapshot with each storm record.
- Allow offline storm documentation using cached weather or manually entered observed conditions.
- Clearly label cached weather and show its last update time.

## Testing Expectations

- Add focused tests for behaviour with meaningful failure risk.
- Prioritize API/domain mapping, weather-code interpretation, storm validation, database-row mapping, persistence cleanup, and important screen states.
- Use React Native Testing Library queries that reflect user-visible behaviour.
- Prefer user interactions over implementation-detail assertions.
- Avoid broad snapshot suites and coverage-driven low-value tests.
- Do not add Detox or another E2E framework unless explicitly authorized.
- Add or update tests with each relevant milestone; do not postpone all testing until the end.

## Verification Commands

For every implementation milestone, run:

```bash
npm run typecheck
npm run lint
npm test -- --runInBand
```

Before cross-platform QA or submission, also run:

```bash
npx expo-doctor
```

Run the smallest relevant test target during iteration, then the full required checks before declaring the milestone complete. Report commands that fail and do not claim verification that was not performed.

## Scope Exclusions

- Do not implement map visualization.
- Do not implement cloud integration or synchronization.
- Do not add authentication, user accounts, push notifications, background location, radar, custom native modules, a custom camera UI, or multiple-photo support.
- Do not begin forecast work until its milestone entry conditions are satisfied and it is explicitly authorized.
- Do not expand scope because implementation finishes early; invest remaining time in reliability, tests, accessibility, documentation, and cross-platform QA.

## Avoid Unnecessary Abstractions

- Do not add Redux, Zustand, or another global store without a demonstrated need and explicit approval.
- Do not add a dependency-injection container.
- Do not create use-case classes for simple actions.
- Do not create generic base repositories, service locators, command buses, event buses, or speculative provider interfaces.
- Do not add an ORM.
- Do not create interfaces that only mirror one trivial implementation unless they enable a concrete test or boundary.
- Do not refactor unrelated stable code while implementing a milestone.
- Do not add a dependency without explaining its need and confirming the existing stack cannot solve the problem cleanly.

## Working Rules

- Inspect relevant files before editing.
- State the expected files and scope before a broad change.
- Make the smallest coherent change that satisfies the active milestone.
- Do not begin a later milestone automatically.
- Keep `docs/AI_USAGE.md` and `docs/TIME_LOG.md` current as work proceeds.
- Review the diff for unrelated changes, secrets, generated artifacts, and dead code before committing.
- Do not commit or push unless the user explicitly authorizes it.
- Report blockers, assumptions, skipped verification, and remaining limitations honestly.

## Definition of Done

A task is complete only when:

- The authorized milestone acceptance criteria are satisfied.
- Required loading, permission, error, cancellation, offline, and retry states are handled where relevant.
- Type checking and linting pass.
- Relevant tests pass and the required full checks have been run at the milestone boundary.
- Required physical-device or platform checks are identified and completed where available.
- No unrelated files or unapproved dependencies were changed.
- Documentation, AI disclosure, and time log are updated when affected.
- The final diff has been reviewed and remaining risks are reported.
