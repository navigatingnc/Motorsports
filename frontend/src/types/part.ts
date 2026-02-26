/**
 * Frontend Part / Inventory types.
 */

export interface PartVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  number?: string | null;
}

export interface Part {
  id: string;
  name: string;
  partNumber?: string | null;
  category: string;
  quantity: number;
  unit: string;
  cost?: number | null;
  supplier?: string | null;
  location?: string | null;
  lowStockThreshold: number;
  notes?: string | null;
  vehicleId?: string | null;
  vehicle?: PartVehicle | null;
  createdAt: string;
  updatedAt: string;
  isLowStock: boolean;
}

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
  vehicleId?: string | null;
}

export interface UpdatePartDto extends Partial<CreatePartDto> {
  vehicleId?: string | null;
}

export interface AdjustQuantityDto {
  adjustment: number;
  notes?: string;
}

export interface InventorySummary {
  totalParts: number;
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  lowStockParts: Array<{
    id: string;
    name: string;
    category: string;
    quantity: number;
    lowStockThreshold: number;
    unit: string;
  }>;
  byCategory: Array<{
    category: string;
    count: number;
    totalItems: number;
    totalValue: number;
  }>;
}

export const PART_CATEGORIES = [
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

export type PartCategory = (typeof PART_CATEGORIES)[number];

export const PART_UNITS = ['pcs', 'sets', 'pairs', 'liters', 'kg', 'g', 'm', 'boxes'] as const;
export type PartUnit = (typeof PART_UNITS)[number];
