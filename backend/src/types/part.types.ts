/**
 * Part / Inventory types for the Motorsports Management API.
 */

export interface CreatePartDto {
  name: string;
  partNumber?: string;
  category: string;
  quantity?: number;
  unit?: string;
  cost?: number;
  supplier?: string;
  location?: string;
  lowStockThreshold?: number;
  notes?: string;
  vehicleId?: string;
}

export interface UpdatePartDto {
  name?: string;
  partNumber?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  cost?: number;
  supplier?: string;
  location?: string;
  lowStockThreshold?: number;
  notes?: string;
  vehicleId?: string | null;
}

export interface AdjustQuantityDto {
  adjustment: number; // positive = add stock, negative = remove stock
  notes?: string;
}

export const VALID_PART_CATEGORIES = [
  'Engine',
  'Suspension',
  'Brakes',
  'Tyres',
  'Bodywork',
  'Drivetrain',
  'Fuel System',
  'Electrical',
  'Electronics',
  'Safety',
  'Consumables',
  'Tools',
  'Other',
] as const;

export const VALID_PART_UNITS = ['pcs', 'sets', 'pairs', 'liters', 'kg', 'g', 'm', 'boxes'] as const;
