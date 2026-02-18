export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  number?: string;
  vin?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleDto {
  make: string;
  model: string;
  year: number;
  category: string;
  number?: string;
  vin?: string;
  notes?: string;
}
