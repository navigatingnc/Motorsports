export interface CreateVehicleDto {
    make: string;
    model: string;
    year: number;
    category: string;
    number?: string;
    vin?: string;
    notes?: string;
}
export interface UpdateVehicleDto {
    make?: string;
    model?: string;
    year?: number;
    category?: string;
    number?: string;
    vin?: string;
    notes?: string;
}
//# sourceMappingURL=vehicle.types.d.ts.map