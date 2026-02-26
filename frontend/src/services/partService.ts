import api from './api';
import type {
  Part,
  CreatePartDto,
  UpdatePartDto,
  AdjustQuantityDto,
  InventorySummary,
} from '../types/part';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  lowStockCount?: number;
  message?: string;
}

export const partService = {
  /** GET /api/parts — with optional filters */
  getAllParts: async (params?: {
    category?: string;
    vehicleId?: string;
    lowStock?: boolean;
    search?: string;
  }): Promise<{ parts: Part[]; lowStockCount: number }> => {
    const query = new URLSearchParams();
    if (params?.category)  query.set('category',  params.category);
    if (params?.vehicleId) query.set('vehicleId', params.vehicleId);
    if (params?.lowStock)  query.set('lowStock',  'true');
    if (params?.search)    query.set('search',    params.search);

    const qs = query.toString();
    const response = await api.get<ApiResponse<Part[]>>(`/api/parts${qs ? `?${qs}` : ''}`);
    return {
      parts: response.data.data,
      lowStockCount: response.data.lowStockCount ?? 0,
    };
  },

  /** GET /api/parts/summary */
  getInventorySummary: async (): Promise<InventorySummary> => {
    const response = await api.get<ApiResponse<InventorySummary>>('/api/parts/summary');
    return response.data.data;
  },

  /** GET /api/parts/:id */
  getPartById: async (id: string): Promise<Part> => {
    const response = await api.get<ApiResponse<Part>>(`/api/parts/${id}`);
    return response.data.data;
  },

  /** POST /api/parts */
  createPart: async (data: CreatePartDto): Promise<Part> => {
    const response = await api.post<ApiResponse<Part>>('/api/parts', data);
    return response.data.data;
  },

  /** PUT /api/parts/:id */
  updatePart: async (id: string, data: UpdatePartDto): Promise<Part> => {
    const response = await api.put<ApiResponse<Part>>(`/api/parts/${id}`, data);
    return response.data.data;
  },

  /** PATCH /api/parts/:id/adjust */
  adjustQuantity: async (id: string, data: AdjustQuantityDto): Promise<Part> => {
    const response = await api.patch<ApiResponse<Part>>(`/api/parts/${id}/adjust`, data);
    return response.data.data;
  },

  /** DELETE /api/parts/:id */
  deletePart: async (id: string): Promise<void> => {
    await api.delete(`/api/parts/${id}`);
  },
};
