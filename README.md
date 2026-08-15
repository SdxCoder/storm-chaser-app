# Storm Chaser

Storm Chaser is a React Native assessment application for retrieving local weather and documenting storm observations on iOS and Android. Users can capture a photo with the system camera, attach a classification, observed conditions, notes, coordinates, timestamp, and immutable weather snapshot, and then save and browse the observation locally.

Reliability, recoverable failure handling, and maintainability are prioritized over visual complexity.

## Implemented Scope

The required workflows are implemented:

- Location-based current weather
- Storm-relevant meteorological metrics
- Distinct loading, permission, not-found, offline, and retry states
- Camera permission, capture, preview, and cancellation
- Validated storm metadata
- Durable local photo and SQLite record persistence
- Weather, Capture, and Storm Log navigation
- Saved-storm list and detail views

Completed Senior bonuses:

- Offline current-weather fallback and storm documentation/browsing
- Pull-to-refresh for weather and the Storm Log
- System-driven light and dark modes
- Compact three-day daily weather forecast

Map visualization and cloud integration are intentionally excluded. The app also does not include authentication, background synchronization, radar, weather alerts, or multiple photos per observation.

## Technology and Architecture

The app uses Expo SDK 54, React Native, Expo Router, and strict TypeScript. TanStack Query owns remote current-weather and forecast state, while React Hook Form owns editable storm metadata.

Open-Meteo transport responses are validated and mapped into domain models before reaching the UI. Feature code lives under `src/features`, device and persistence boundaries live under `src/services`, and route files under `app` remain thin.

Expo SQLite is the source of truth for structured storm records and the persisted current-weather cache. When a storm is saved, Expo FileSystem copies the temporary camera image into the app-owned `storm-photos` directory. SQLite stores a durable photo locator rather than image bytes. If record insertion fails, the newly copied orphan file is removed while the recoverable draft and temporary image remain available for retry.

A successful live current-weather response updates the matching rounded-coordinate cache entry. When the network request fails or the device is offline, a matching cached snapshot can be displayed with its source and observation time. When no matching cache exists, the app presents a specific offline state while still allowing storm documentation through manually entered observed conditions.

Connectivity restoration triggers a fresh current-weather request. Forecast data is requested separately, is not persisted for offline cold starts, and cannot prevent current weather from being displayed.

## Setup and Run

### Prerequisites

- Node.js and npm compatible with Expo SDK 54
- Git
- Xcode on macOS for iOS development
- Android Studio and the Android SDK for Android development
- A connected physical device with developer mode enabled where required

Open-Meteo does not require an API key, so no environment file is needed.

Install dependencies:

```bash
npm ci
```

Start the Expo development server:

```bash
npm start
```

Build and run a native development build on a connected physical device:

```bash
npm run ios
npm run android
```

These package scripts invoke the local Expo iOS and Android device workflows. Grant location and camera permissions when exercising those features.

Build locally in Release configuration for offline cold-start and restart-persistence verification:

```bash
npx expo run:ios --device --configuration Release
npx expo run:android --device --variant release
```

Release builds embed the JavaScript bundle and therefore allow offline cold-start testing without Metro. EAS Build is not required for local development or assessment verification.

## Verification and Testing

Run the automated checks:

```bash
npm run typecheck
npm run lint
npm test -- --runInBand
npx expo-doctor
npm ls
```

The focused Jest and React Native Testing Library suite mocks network, connectivity, SQLite, filesystem, camera, and location boundaries. It prioritizes:

- Transport and domain mapping
- WMO weather-code interpretation
- Weather-cache fallback and write failures
- Storm validation
- Camera cancellation and recapture
- Database row/domain mapping
- Failed-save photo cleanup
- Duplicate-save protection
- Draft preservation
- Storm Log and detail states
- Forecast failure isolation
- User-visible permission, offline, error, and retry states

Automated tests focus on high-risk application logic and important UI states. Native workflows—including camera, location, permissions, offline restart, and durable-photo persistence—were verified manually. Network requests are mocked, so the automated suite does not depend on Open-Meteo availability.

## Manual Verification

The core workflow matrix was completed on one physical iOS device and one physical Android device. Offline cold-start and restart-persistence checks used locally compiled Release builds that do not depend on Metro.

| Platform / device | Build | Workflow | Result |
|---|---|---|---|
| iPhone 16 Pro Max, iOS 26 | Native development build | App launch and navigation; location approval and denial; current weather; pull-to-refresh; camera permission, capture and cancellation; keyboard interaction; draft validation; storm Save; Storm Log and detail | Passed |
| Honor 9X, Android 9 (API 28) | Native development build | App launch and navigation; location approval and denial; current weather; pull-to-refresh; camera permission, capture and cancellation; keyboard interaction; draft validation; storm Save; Storm Log and detail | Passed |
| iPhone 16 Pro Max, iOS 26 | Local Release build | Cached and no-cache offline states; offline cold start; offline capture, Save and browsing; reconnect refresh; SQLite record and durable-photo survival after force-close and relaunch | Passed |
| Honor 9X, Android 9 (API 28) | Local Release build | Cached and no-cache offline states; offline cold start; offline capture, Save and browsing; reconnect refresh; SQLite record and durable-photo survival after force-close and relaunch | Passed |
| Both physical devices | Native development build | Three-day forecast, forecast retry, immutable historical weather, and system light/dark modes | Passed |
| iPhone with VoiceOver; Android with TalkBack | Native development build | Focused screen-reader navigation and completion of the storm-documentation and Save workflow | Passed within the tested scope |
| Both physical devices | Native development build | Rapid duplicate-save interaction | Pending; covered by focused automated tests |

The screen-reader pass was intentionally focused. Core navigation, storm documentation, and Save were operable with VoiceOver and TalkBack, but every permission, error, offline, and retry state was not exhaustively tested with assistive technology.

## Known Limitations

- Manual verification covers one physical iOS device and one physical Android device; broader device and OS-version coverage was outside the assessment timeframe.
- VoiceOver and TalkBack were used for a focused core-workflow pass rather than an exhaustive assistive-technology matrix across every application state.
- Forecast data is not persisted for offline use.
- Current-weather cache entries are matched using coordinates rounded to three decimal places to avoid displaying cached weather for an unrelated location.
- Record deletion is not implemented.

## Explicit Scope Exclusions

- Map visualization
- Cloud integration and synchronization
- Background synchronization
- Authentication
- Radar and weather alerts
- Multiple photos per observation

See [AI usage](docs/AI_USAGE.md) and [time log](docs/TIME_LOG.md) for the required assessment disclosures.