export interface Event {
  id: string;
  name: string;
  type: string;
  venue: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDto {
  name: string;
  type: string;
  venue: string;
  location: string;
  startDate: string;
  endDate: string;
  status?: string;
  description?: string;
  notes?: string;
}

export type EventType = 'Race' | 'Qualifying' | 'Practice' | 'Test Day' | 'Track Day' | 'Other';
export type EventStatus = 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';
