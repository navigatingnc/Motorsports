export interface SetupSheet {
  id: string;
  vehicleId: string;
  eventId: string;
  createdById: string;
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
  createdAt: string;
  updatedAt: string;
  // Populated relations
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    number?: string;
  };
  event?: {
    id: string;
    name: string;
    type: string;
  };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateSetupSheetDto {
  vehicleId: string;
  eventId: string;
  sessionType: string;
  sessionNumber?: number;
  tyreFrontLeft?: string;
  tyreFrontRight?: string;
  tyreRearLeft?: string;
  tyreRearRight?: string;
  tyrePressureFrontLeft?: number;
  tyrePressureFrontRight?: number;
  tyrePressureRearLeft?: number;
  tyrePressureRearRight?: number;
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
  frontWingAngle?: number;
  rearWingAngle?: number;
  downforceLevel?: string;
  brakeBias?: number;
  brakeCompound?: string;
  engineMap?: string;
  differentialEntry?: number;
  differentialMid?: number;
  differentialExit?: number;
  fuelLoad?: number;
  notes?: string;
  driverFeedback?: string;
}

export const SESSION_TYPES = [
  'Practice',
  'Qualifying',
  'Race',
  'Test',
  'Warm-Up',
  'Other',
] as const;

export const DOWNFORCE_LEVELS = ['Low', 'Medium', 'High'] as const;

export type SessionType = (typeof SESSION_TYPES)[number];
export type DownforceLevel = (typeof DOWNFORCE_LEVELS)[number];
