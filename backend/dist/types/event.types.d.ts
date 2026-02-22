export interface CreateEventDto {
    name: string;
    type: string;
    venue: string;
    location: string;
    startDate: string | Date;
    endDate: string | Date;
    status?: string;
    description?: string;
    notes?: string;
}
export interface UpdateEventDto {
    name?: string;
    type?: string;
    venue?: string;
    location?: string;
    startDate?: string | Date;
    endDate?: string | Date;
    status?: string;
    description?: string;
    notes?: string;
}
export declare const VALID_EVENT_TYPES: readonly ["Race", "Qualifying", "Practice", "Test Day", "Track Day", "Other"];
export declare const VALID_EVENT_STATUSES: readonly ["Upcoming", "In Progress", "Completed", "Cancelled"];
//# sourceMappingURL=event.types.d.ts.map