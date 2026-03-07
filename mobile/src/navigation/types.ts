/**
 * Parameter list for the unauthenticated (Auth) stack navigator.
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

/**
 * Parameter list for the authenticated (App) stack navigator.
 * Additional screens (Vehicles, Events, etc.) will be added in Phase 24.
 */
export type AppStackParamList = {
  Home: undefined;
};
