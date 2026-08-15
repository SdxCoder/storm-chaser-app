# AI Usage Disclosure

## Tools used

- OpenAI Codex

## Purposes

- Audited the architecture plan against the assessment and repository state.
- Initialized and verified the Expo SDK 54 application foundation.
- Completed the Milestone 1 provider, navigation, placeholder-screen, and theme shell.
- Assisted with dependency compatibility, native configuration, linting, type checking, and test setup.
- Implemented the Milestone 2 foreground-location flow, Open-Meteo boundary, current-weather query, weather UI states, pull-to-refresh, and focused tests.
- Confirmed the requested Open-Meteo current response shape and units with a live curl request using representative Calgary coordinates before defining the transport type.
- Implemented the Milestone 3 temporary camera-capture workflow, local draft orchestration, React Hook Form metadata fields, immutable live-weather snapshot attachment, coordinate/accuracy capture, validation, accessible UI states, and focused tests.
- Refined Milestone 3 by isolating the camera platform boundary, protecting recapture from superseded location results, and decomposing capture presentation into cohesive feature-local components without changing state ownership or persistence scope.
- Assisted with Milestone 3 automated verification and scope review to keep durable photo storage and SQLite storm persistence excluded.
- Implemented the Milestone 4 versioned SQLite schema, explicit row/domain mapping, storm repository, SDK 54 durable photo-storage boundary, compensated Save workflow, duplicate-submission protection, focus-refreshed Storm Log, storm detail route, missing-record and missing-photo states, and focused tests.
- Verified Milestone 4 with strict type checking, Expo lint, 75 Jest tests, and all 18 Expo Doctor checks; physical-device verification remains pending.
- Diagnosed an iOS development-build container UUID change using device diagnostics, then repaired Milestone 4 photo persistence with stable logical photo URIs, a version-two migration for legacy absolute URIs, current-container resolution, and focused regression tests.
- Re-verified the Milestone 4 repair with strict type checking, Expo lint, 85 Jest tests, and all 18 Expo Doctor checks; the user subsequently confirmed all required manual and physical-device checks pass.

## AI-assisted code

Codex generated the initial application shell, Expo configuration, provider composition, three-tab navigation, semantic theme tokens, lint and test configuration, and foundation tests. For Milestone 2, Codex generated the location service, validated Open-Meteo mapping, TanStack Query integration, current-weather presentation and error states, and focused unit tests. For Milestone 3, Codex generated the in-memory storm draft model and validation, system-camera permission/capture boundary, capture orchestration, metadata form and accessibility states, current-coordinate and live-weather snapshot integration, and focused unit/component tests. For Milestone 4, Codex generated the SQLite database migrations and provider, persisted storm model/row mapping and repository, stable durable-photo locator and current-container resolution, durable photo copy and cleanup boundary, Save coordination and UI states, Storm Log and detail flows, and focused persistence/component tests. Weather persistence/cache, record deletion, forecast, map, and cloud features have not been generated or implemented.
