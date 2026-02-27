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
    adjustment: number;
    notes?: string;
}
export declare const VALID_PART_CATEGORIES: readonly ["Engine", "Suspension", "Brakes", "Tyres", "Bodywork", "Drivetrain", "Fuel System", "Electrical", "Electronics", "Safety", "Consumables", "Tools", "Other"];
export declare const VALID_PART_UNITS: readonly ["pcs", "sets", "pairs", "liters", "kg", "g", "m", "boxes"];
//# sourceMappingURL=part.types.d.ts.map