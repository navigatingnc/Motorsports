/**
 * Parameter list for the unauthenticated (Auth) stack navigator.
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

/**
 * Parameter list for the authenticated (App) stack navigator.
 * Includes all screens added in Phase 24 (Vehicles, Events, Lap Times).
 */
export type AppStackParamList = {
  Home: undefined;
  // Vehicle screens
  Vehicles: undefined;
  VehicleDetail: { vehicleId: string };
  // Event screens
  Events: undefined;
  EventDetail: { eventId: string };
  // Lap time recording
  RecordLapTime: undefined;
};

/**
 * Parameter list for the bottom tab navigator.
 * Each tab is a root of its own stack navigator.
 */
export type TabParamList = {
  VehiclesTab: undefined;
  EventsTab: undefined;
  LapTimerTab: undefined;
};
