# AI Usage Disclosure

## Tools Used

- OpenAI ChatGPT
- OpenAI Codex

## How AI Was Used

### Planning and architecture

ChatGPT was used to:

- Analyze the assessment requirements and identify the expected Senior-level engineering signals.
- Compare architectural and technology options within the 24-hour constraint.
- Define and challenge the feature-based, Bulletproof-inspired project structure.
- Establish milestone scope, acceptance criteria, exclusions, and timeboxes.
- Review implementation decisions and explain their trade-offs.
- Prepare focused prompts for each implementation and review milestone.
- Assist with reviewer-facing documentation wording and final submission planning.

Codex was used to inspect the repository, validate plans against the existing implementation, implement approved milestones, run verification commands, review diffs, and identify defects or missing coverage.

### Project foundation

Codex assisted with:

- Initializing the Expo SDK 54 application.
- Configuring strict TypeScript, Expo Router, linting, testing, and native permissions.
- Creating the provider composition, three-tab navigation, semantic theme tokens, and placeholder application shell.
- Checking dependency compatibility and Expo configuration.

### Current weather

Codex assisted with:

- The foreground-location permission and acquisition flow.
- The Open-Meteo transport boundary and validated domain mapping.
- TanStack Query integration.
- Current-weather loading, success, permission, not-found, offline, and retry states.
- Pull-to-refresh and focused tests.
- Confirmation of the requested Open-Meteo response shape and units through a live `curl` request before finalizing the transport mapping.

### Storm capture and metadata

Codex assisted with:

- The system-camera permission and capture boundary using Expo Image Picker.
- Camera cancellation and unavailable-camera outcomes.
- In-memory storm-draft orchestration.
- React Hook Form metadata fields and validation.
- Coordinate, timestamp, and immutable weather-snapshot attachment.
- Manual observed-condition fallback.
- Photo preview and accessible form states.
- Recapture protection against stale or superseded location and weather results.
- Decomposition of the capture screen into cohesive feature-local components.
- Focused unit and component tests.

Durable photo storage and SQLite storm persistence were deliberately excluded from this milestone and implemented separately.

### Storm persistence

Codex assisted with:

- Versioned Expo SQLite migrations.
- Explicit SQLite row-to-domain mapping.
- The storm repository and local query boundaries.
- Durable photo copying using Expo FileSystem.
- Stable logical photo locators and current-container resolution.
- Cleanup of an orphaned copied photo when database insertion fails.
- Duplicate-submission protection.
- Recoverable Save failure handling.
- Storm Log refresh and navigation.
- Storm detail, missing-record, and missing-photo states.
- Focused persistence and component tests.

Codex also helped diagnose an iOS application-container UUID change observed during device testing. The resulting correction replaced container-dependent absolute photo paths with stable logical locators, added migration handling for legacy values, and introduced regression coverage.

### Offline behaviour and theming

Codex assisted with:

- The SQLite current-weather cache migration and data-access boundary.
- Rounded-coordinate cache identity.
- Live-weather cache updates and network-failure fallback.
- NetInfo integration with TanStack Query’s online state.
- Reconnect refresh behaviour.
- Cached-weather, offline, and no-cache presentation.
- Manual observed-condition guidance for offline documentation.
- Complete system light/dark theme application.
- Focused cache, reconnect, and theme-related tests.

Offline cold-start, cached/no-cache behaviour, storm capture and persistence, reconnect refresh, and restart persistence were manually verified using locally compiled Release builds.

### Weather forecast

Codex assisted with:

- A separate three-day Open-Meteo daily forecast request.
- Explicit forecast transport and domain models.
- Defensive mapping of Open-Meteo parallel daily arrays.
- A compact accessible forecast component.
- Loading, offline, malformed-response, failure, and retry states isolated from current weather.
- Focused forecast mapping and component tests.

### Stabilization and documentation

Codex and ChatGPT assisted with:

- Repository-wide source, test, dependency, and Git-diff review.
- Identification of focused transport, offline-forecast, accessibility, and documentation gaps.
- Accessibility labels, roles, form feedback, and screen-reader summaries.
- README structure and wording.
- AI usage disclosure.
- Time-log reconciliation.
- Manual-verification reporting.
- Final verification and submission planning.

## AI-Assisted Code

Codex generated or substantially assisted code in the following areas:

- Expo application configuration and provider composition
- Expo Router navigation
- Semantic theme tokens and light/dark mode support
- Location and camera platform boundaries
- Open-Meteo current-weather and forecast clients
- Transport validation and domain mapping
- TanStack Query hooks
- React Hook Form storm metadata workflow
- Storm draft orchestration and validation
- SQLite initialization, migrations, repositories, and row mapping
- Durable photo storage, resolution, and failure cleanup
- Storm Save, Log, and detail workflows
- Persistent current-weather caching and reconnect behaviour
- Weather, forecast, offline, error, permission, and retry UI states
- Focused Jest and React Native Testing Library tests

The candidate selected and challenged the architecture, constrained milestone scope, reviewed generated code and diffs, manually exercised native workflows, identified implementation concerns, requested corrections, and made the final decisions about what to include or exclude.

Record deletion, map visualization, cloud integration, authentication, background synchronization, radar, alerts, and multiple-photo support were not implemented.

## Review and Validation

AI-assisted work was reviewed against:

- The original assessment requirements
- Repository guidance in `AGENTS.md`
- The locked architecture and milestone plan
- Existing source code and tests
- Git history and complete milestone diffs

Automated validation included:

```bash
npm run typecheck
npm run lint
npm test -- --runInBand
npx expo-doctor
npm ls
```

Automated tests use mocked network, connectivity, SQLite, filesystem, camera, and location boundaries. They do not depend on live Open-Meteo responses or native end-to-end tooling.

The candidate manually verified the core workflow matrix on:

- iPhone 16 Pro Max running iOS 26
- Honor 9X running Android 9 (API 28)

Manual verification included locally compiled Release-build checks for offline cold starts, cached and no-cache weather states, offline storm documentation, restart persistence, durable photos, and reconnect refresh.

A focused accessibility pass was also performed using VoiceOver on iOS and TalkBack on Android. Core navigation and the storm-documentation and Save workflow were operable within the tested scope; every permission, error, offline, and retry state was not exhaustively tested with assistive technology.