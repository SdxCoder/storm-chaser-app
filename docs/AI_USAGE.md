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

## AI-assisted code

Codex generated the initial application shell, Expo configuration, provider composition, three-tab navigation, semantic theme tokens, lint and test configuration, and foundation tests. For Milestone 2, Codex generated the location service, validated Open-Meteo mapping, TanStack Query integration, current-weather presentation and error states, and focused unit tests. For Milestone 3, Codex generated the in-memory storm draft model and validation, system-camera permission/capture boundary, capture orchestration, metadata form and accessibility states, current-coordinate and live-weather snapshot integration, and focused unit/component tests. Durable photo copying, weather persistence/cache, storm persistence, Storm Log functionality, and forecast features have not been generated or implemented.
