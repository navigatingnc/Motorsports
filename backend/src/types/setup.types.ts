export interface CreateSetupSheetDto {
  vehicleId: string;
  eventId: string;
  sessionType: string;
  sessionNumber?: number;

  // Tyre setup
  tyreFrontLeft?: string;
  tyreFrontRight?: string;
  tyreRearLeft?: string;
  tyreRearRight?: string;
  tyrePressureFrontLeft?: number;
  tyrePressureFrontRight?: number;
  tyrePressureRearLeft?: number;
  tyrePressureRearRight?: number;

  // Suspension setup
  rideHeightFront?: number;
  rideHeightRear?: number;
  springRateFront?: number;
  springRateRear?: number;
  damperFront?: string;
  damperRear?: string;
  camberFront?: number;
  camberRear?: number;
  toeInFront?: number;
  toeInRear?: number;

  // Aerodynamics
  frontWingAngle?: number;
  rearWingAngle?: number;
  downforceLevel?: string;

  // Brakes
  brakeBias?: number;
  brakeCompound?: string;

  // Engine / Drivetrain
  engineMap?: string;
  differentialEntry?: number;
  differentialMid?: number;
  differentialExit?: number;

  // Fuel
  fuelLoad?: number;

  // Notes
  notes?: string;
  driverFeedback?: string;
}

export interface UpdateSetupSheetDto {
  vehicleId?: string;
  eventId?: string;
  sessionType?: string;
  sessionNumber?: number;

  // Tyre setup
  tyreFrontLeft?: string;
  tyreFrontRight?: string;
  tyreRearLeft?: string;
  tyreRearRight?: string;
  tyrePressureFrontLeft?: number;
  tyrePressureFrontRight?: number;
  tyrePressureRearLeft?: number;
  tyrePressureRearRight?: number;

  // Suspension setup
  rideHeightFront?: number;
  rideHeightRear?: number;
  springRateFront?: number;
  springRateRear?: number;
  damperFront?: string;
  damperRear?: string;
  camberFront?: number;
  camberRear?: number;
  toeInFront?: number;
  toeInRear?: number;

  // Aerodynamics
  frontWingAngle?: number;
  rearWingAngle?: number;
  downforceLevel?: string;

  // Brakes
  brakeBias?: number;
  brakeCompound?: string;

  // Engine / Drivetrain
  engineMap?: string;
  differentialEntry?: number;
  differentialMid?: number;
  differentialExit?: number;

  // Fuel
  fuelLoad?: number;

  // Notes
  notes?: string;
  driverFeedback?: string;
}

export const VALID_SESSION_TYPES = [
  'Practice',
  'Qualifying',
  'Race',
  'Test',
  'Warm-Up',
  'Other',
] as const;

export const VALID_DOWNFORCE_LEVELS = ['Low', 'Medium', 'High'] as const;
