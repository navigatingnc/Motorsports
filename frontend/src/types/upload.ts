/**
 * Frontend types for the Photo & Document Uploads feature (Phase 15).
 */

export type UploadEntityType = 'vehicle' | 'event';
export type FileCategory = 'photo' | 'document';

/** A file upload record returned from the API */
export interface Upload {
  id:           string;
  entityType:   UploadEntityType;
  entityId:     string;
  fileName:     string;
  fileKey:      string;
  fileUrl:      string;
  mimeType:     string;
  category:     FileCategory;
  sizeBytes:    number | null;
  uploadedById: string;
  uploadedBy?: {
    id:        string;
    firstName: string;
    lastName:  string;
    email:     string;
  };
  createdAt:    string;
}

/** Request payload for generating a presigned upload URL */
export interface PresignUploadRequest {
  entityType: UploadEntityType;
  entityId:   string;
  fileName:   string;
  fileType:   string;
  category:   FileCategory;
}

/** Response from the presign endpoint */
export interface PresignUploadResponse {
  uploadUrl:  string;
  fileKey:    string;
  publicUrl:  string;
  expiresIn:  number;
}

/** Request payload for confirming a completed upload */
export interface ConfirmUploadRequest {
  fileKey:    string;
  entityType: UploadEntityType;
  entityId:   string;
  fileName:   string;
  mimeType:   string;
  category:   FileCategory;
  sizeBytes?: number;
}
