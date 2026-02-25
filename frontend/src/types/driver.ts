export interface DriverUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface Driver {
  id: string;
  userId: string;
  licenseNumber: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  bio: string | null;
  emergencyContact: string | null;
  medicalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  user: DriverUser;
}

export interface CreateDriverDto {
  userId: string;
  licenseNumber?: string;
  nationality?: string;
  dateOfBirth?: string;
  bio?: string;
  emergencyContact?: string;
  medicalNotes?: string;
}

export interface UpdateDriverDto {
  licenseNumber?: string;
  nationality?: string;
  dateOfBirth?: string;
  bio?: string;
  emergencyContact?: string;
  medicalNotes?: string;
}
