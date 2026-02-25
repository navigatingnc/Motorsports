export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  driver?: {
    id: string;
    licenseNumber?: string;
    nationality?: string;
  } | null;
}

export const VALID_ROLES = ['admin', 'user', 'viewer'] as const;
export type UserRole = (typeof VALID_ROLES)[number];
