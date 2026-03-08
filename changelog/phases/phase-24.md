# Phase 24: Mobile App — Core Screens (Vehicles, Events, Lap Times)

**Date:** March 8, 2026 &nbsp;|&nbsp; **Status:** ✅ Completed  
**Branch:** `phase-24-mobile-core-screens`

---

## Summary

Replaced the Phase 23 placeholder `HomeScreen` with a fully functional three-tab mobile application. Implemented `VehiclesScreen` with pull-to-refresh and category-badged cards, `VehicleDetailScreen` with full specifications and a lap time history table, `EventsScreen` with upcoming/past tab switching, `EventDetailScreen` with a live weather widget and setup sheet viewer, and `RecordLapTimeScreen` with a 10 ms-resolution stopwatch that records splits locally and submits them to the backend in real time. All screens are wired together via a `TabNavigator` (bottom tabs) where each tab owns its own stack navigator for proper back-navigation.

---

## Tasks Completed

### 1. Type Definitions

Three new type modules were created to mirror the backend response shapes:

| File | Types Defined |
| :--- | :--- |
| `mobile/src/types/vehicle.types.ts` | `Vehicle`, `VehicleListResponse`, `VehicleDetailResponse`, `LapTimeSummary` |
| `mobile/src/types/event.types.ts` | `RaceEvent`, `EventListResponse`, `EventDetailResponse`, `WeatherData`, `WeatherResponse`, `SetupSheet`, `SetupSheetListResponse` |
| `mobile/src/types/laptime.types.ts` | `LapTime`, `LapTimeCreateDto`, `LapTimeListResponse`, `LapTimeCreateResponse` |

### 2. Service Modules

Three new service modules were added to encapsulate all API communication:

**`vehicle.service.ts`**
- `getVehicles()` — fetches all vehicles from `GET /api/vehicles`
- `getVehicle(id)` — fetches a single vehicle from `GET /api/vehicles/:id`
- `getVehicleLapTimes(vehicleId)` — fetches lap times from `GET /api/analytics/laptimes?vehicleId=`
- `formatLapTime(ms)` — converts milliseconds to `M:SS.mmm` or `SS.mmm` display string

**`event.service.ts`**
- `getEvents()` — fetches all events from `GET /api/events`
- `getEvent(id)` — fetches a single event from `GET /api/events/:id`
- `getEventWeather(eventId)` — fetches weather from `GET /api/events/:id/weather` (returns `null` on failure)
- `getEventSetups(eventId)` — fetches setup sheets from `GET /api/setups?eventId=` (returns `[]` on failure)
- `isUpcoming(event)` — returns `true` if the event date is today or in the future
- `describeWeatherCode(code)` — maps WMO weather codes to human-readable labels and emoji

**`laptime.service.ts`**
- `recordLapTime(dto)` — POSTs a new lap time to `POST /api/analytics/laptimes`
- `getLapTimes(eventId, vehicleId?)` — fetches lap times with optional vehicle filter
- `formatLapTime(ms)` — same millisecond formatter as vehicle service

### 3. VehiclesScreen (`src/screens/VehiclesScreen.tsx`)

- `FlatList`-based list of all vehicles with pull-to-refresh via `RefreshControl`.
- Each card displays make, model, year, color, VIN (truncated), and a colour-coded category badge (sedan → blue, sports → red, truck → amber, etc.).
- Tapping a card navigates to `VehicleDetailScreen` with the vehicle's ID.
- Full error state with retry button; empty state with guidance text.

### 4. VehicleDetailScreen (`src/screens/VehicleDetailScreen.tsx`)

- Parallel `Promise.all` fetch of vehicle data and lap times on mount.
- **Specifications section**: make, model, year, category, color, VIN, and notes displayed in a labelled grid.
- **Performance summary**: total lap count and best lap time in highlighted stat cards.
- **Lap time history table**: lap number, formatted time, and event name columns; best lap row highlighted in red.
- Pull-to-refresh support.

### 5. EventsScreen (`src/screens/EventsScreen.tsx`)

- Fetches all events and splits them into upcoming (date ≥ today, sorted ascending) and past (date < today, sorted descending) arrays.
- **Tab switcher** with pill-style active indicator toggles between the two lists.
- Each event card shows name, venue, date, description (truncated to 2 lines), and a countdown badge ("Today", "Tomorrow", "In N days", "N days ago").
- Pull-to-refresh and empty state handling per tab.

### 6. EventDetailScreen (`src/screens/EventDetailScreen.tsx`)

- Parallel `Promise.all` fetch of event, weather, and setup sheets.
- **Weather widget**: WMO code mapped to emoji + label, temperature in °C, and wind speed in km/h. Shows a graceful "unavailable" message if the endpoint fails.
- **Setup sheets section**: lists all setup sheets for the event. Each sheet shows creation date, notes, a 2×2 tyre pressure grid (FL/FR/RL/RR), and ride height (front/rear) where data is present.
- Pull-to-refresh support.

### 7. RecordLapTimeScreen (`src/screens/RecordLapTimeScreen.tsx`)

- **Event and vehicle selectors**: horizontal chip scrollers allow the user to pick the active event and vehicle before starting (locked during a running session to prevent accidental changes).
- **Stopwatch display**: `setInterval` at 10 ms resolution updates total elapsed time and current lap elapsed time simultaneously.
- **Controls**:
  - `Start` / `Resume` — begins or resumes the timer.
  - `Lap` — records the current lap split, resets the lap timer, and submits to the backend asynchronously.
  - `Stop` — pauses the timer without recording a lap.
  - `Finish` — records the final lap, stops the timer, and shows a completion `Alert` with the lap count.
  - `Reset` — clears all state (only available when stopped).
- **Splits table**: displays all recorded laps in reverse order with lap number, formatted time, and diff vs. best lap. Best lap row is highlighted in red; slower laps show the delta in amber.
- Backend submission is non-blocking: the split is recorded locally immediately and saved to the server in the background.

### 8. TabNavigator (`src/navigation/TabNavigator.tsx`)

- `createBottomTabNavigator` with three tabs: **Vehicles** (🚗), **Events** (🏁), and **Lap Timer** (⏱).
- Each tab hosts its own `createNativeStackNavigator` so that detail screens (e.g., `VehicleDetailScreen`) maintain proper back-navigation within the tab without affecting other tabs.
- Tab bar styled to match the app's dark theme (`#0F172A` background, `#E11D48` active tint).

### 9. AppNavigator Update (`src/navigation/AppNavigator.tsx`)

- Replaced the Phase 23 placeholder stack (single `HomeScreen`) with a direct render of `TabNavigator`.
- `HomeScreen` is retained in the codebase but is no longer mounted by the navigator.

### 10. Navigation Types Update (`src/navigation/types.ts`)

- Extended `AppStackParamList` with `Vehicles`, `VehicleDetail: { vehicleId }`, `Events`, `EventDetail: { eventId }`, and `RecordLapTime`.
- Added new `TabParamList` type with `VehiclesTab`, `EventsTab`, and `LapTimerTab`.

---

## Generated Code

| File | Type | Description |
| :--- | :--- | :--- |
| `mobile/src/types/vehicle.types.ts` | New | Vehicle and lap time summary type definitions |
| `mobile/src/types/event.types.ts` | New | Event, weather, and setup sheet type definitions |
| `mobile/src/types/laptime.types.ts` | New | Lap time record and DTO type definitions |
| `mobile/src/services/vehicle.service.ts` | New | Vehicle API calls + `formatLapTime` helper |
| `mobile/src/services/event.service.ts` | New | Event, weather, and setup sheet API calls + helpers |
| `mobile/src/services/laptime.service.ts` | New | Lap time record/fetch API calls + `formatLapTime` helper |
| `mobile/src/screens/VehiclesScreen.tsx` | New | Vehicle list with pull-to-refresh and category badges |
| `mobile/src/screens/VehicleDetailScreen.tsx` | New | Vehicle specs, performance summary, and lap history |
| `mobile/src/screens/EventsScreen.tsx` | New | Event list with upcoming/past tabs and countdown badges |
| `mobile/src/screens/EventDetailScreen.tsx` | New | Event detail with weather widget and setup sheets |
| `mobile/src/screens/RecordLapTimeScreen.tsx` | New | Live stopwatch with lap recording and backend submission |
| `mobile/src/navigation/TabNavigator.tsx` | New | Bottom tab navigator with per-tab stack navigators |
| `mobile/src/navigation/AppNavigator.tsx` | Modified | Replaced HomeScreen stack with TabNavigator |
| `mobile/src/navigation/types.ts` | Modified | Extended `AppStackParamList`; added `TabParamList` |

---

## Next Phase Preview

Phase 25 will implement **Advanced Analytics: Telemetry Data Ingestion & Visualization** — defining a `Telemetry` Prisma model, building a high-throughput `POST /api/telemetry/batch` endpoint, and creating a `TelemetryDetailPage.tsx` with synchronized multi-channel charts (speed, throttle, brake traces) and a GPS track map overlay.

---
