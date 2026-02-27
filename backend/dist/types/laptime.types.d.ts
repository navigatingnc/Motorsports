export interface CreateLapTimeDto {
    driverId: string;
    vehicleId: string;
    eventId: string;
    lapNumber: number;
    lapTimeMs: number;
    sessionType: string;
    sector1Ms?: number;
    sector2Ms?: number;
    sector3Ms?: number;
    isValid?: boolean;
    notes?: string;
}
export interface UpdateLapTimeDto {
    lapNumber?: number;
    lapTimeMs?: number;
    sessionType?: string;
    sector1Ms?: number;
    sector2Ms?: number;
    sector3Ms?: number;
    isValid?: boolean;
    notes?: string;
}
export declare const VALID_LAP_SESSION_TYPES: readonly ["Practice", "Qualifying", "Race", "Test"];
//# sourceMappingURL=laptime.types.d.ts.map