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

export const VALID_EVENT_TYPES = ['Race', 'Qualifying', 'Practice', 'Test Day', 'Track Day', 'Other'] as const;
export const VALID_EVENT_STATUSES = ['Upcoming', 'In Progress', 'Completed', 'Cancelled'] as const;
