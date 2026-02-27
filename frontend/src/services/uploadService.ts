import axios from 'axios';
import api from './api';
import type {
  Upload,
  PresignUploadRequest,
  PresignUploadResponse,
  ConfirmUploadRequest,
  UploadEntityType,
  FileCategory,
} from '../types/upload';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

export const uploadService = {
  /**
   * Step 1 — Request a presigned PUT URL from the backend.
   */
  getPresignedUrl: async (req: PresignUploadRequest): Promise<PresignUploadResponse> => {
    const response = await api.post<ApiResponse<PresignUploadResponse>>(
      '/api/uploads/presign',
      req,
    );
    return response.data.data;
  },

  /**
   * Step 2 — PUT the file directly to S3 using the presigned URL.
   * Uses plain axios (no auth header — S3 presigned URLs don't need it).
   */
  uploadToS3: async (
    presignedUrl: string,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<void> => {
    await axios.put(presignedUrl, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    });
  },

  /**
   * Step 3 — Confirm the upload and persist metadata in the database.
   */
  confirmUpload: async (req: ConfirmUploadRequest): Promise<Upload> => {
    const response = await api.post<ApiResponse<Upload>>('/api/uploads/confirm', req);
    return response.data.data;
  },

  /**
   * Full upload flow: presign → upload to S3 → confirm.
   * Returns the persisted Upload record.
   */
  uploadFile: async (
    entityType: UploadEntityType,
    entityId: string,
    file: File,
    category: FileCategory,
    onProgress?: (percent: number) => void,
  ): Promise<Upload> => {
    // 1. Get presigned URL
    const presigned = await uploadService.getPresignedUrl({
      entityType,
      entityId,
      fileName: file.name,
      fileType: file.type,
      category,
    });

    // 2. Upload directly to S3
    await uploadService.uploadToS3(presigned.uploadUrl, file, onProgress);

    // 3. Confirm and persist
    const record = await uploadService.confirmUpload({
      fileKey:    presigned.fileKey,
      entityType,
      entityId,
      fileName:   file.name,
      mimeType:   file.type,
      category,
      sizeBytes:  file.size,
    });

    return record;
  },

  /**
   * List uploads for a given entity (or all uploads with optional filters).
   */
  listUploads: async (params?: {
    entityType?: UploadEntityType;
    entityId?:   string;
    category?:   FileCategory;
  }): Promise<Upload[]> => {
    const query = new URLSearchParams();
    if (params?.entityType) query.set('entityType', params.entityType);
    if (params?.entityId)   query.set('entityId',   params.entityId);
    if (params?.category)   query.set('category',   params.category);
    const qs = query.toString();
    const response = await api.get<ApiResponse<Upload[]>>(
      `/api/uploads${qs ? `?${qs}` : ''}`,
    );
    return response.data.data;
  },

  /**
   * Get a short-lived download URL for a specific file.
   */
  getDownloadUrl: async (id: string): Promise<string> => {
    const response = await api.get<ApiResponse<{ downloadUrl: string; expiresIn: number }>>(
      `/api/uploads/${id}/download`,
    );
    return response.data.data.downloadUrl;
  },

  /**
   * Delete a file from S3 and remove its database record.
   */
  deleteUpload: async (id: string): Promise<void> => {
    await api.delete(`/api/uploads/${id}`);
  },
};
