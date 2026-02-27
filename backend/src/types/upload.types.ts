/**
 * Types for the Photo & Document Upload feature (Phase 15).
 */

/** Supported entity types that can have file attachments */
export type UploadEntityType = 'vehicle' | 'event';

/** Supported file categories */
export type FileCategory = 'photo' | 'document';

/** Request body for generating a presigned upload URL */
export interface PresignedUploadRequest {
  entityType: UploadEntityType;
  entityId:   string;
  fileName:   string;
  fileType:   string;   // MIME type, e.g. "image/jpeg"
  category:   FileCategory;
}

/** Response returned after generating a presigned URL */
export interface PresignedUploadResponse {
  uploadUrl:   string;  // PUT to this URL to upload the file
  fileKey:     string;  // S3 object key (stored in DB)
  publicUrl:   string;  // URL to retrieve the file after upload
  expiresIn:   number;  // Seconds until the presigned URL expires
}

/** Metadata record stored in the database after a successful upload */
export interface UploadRecord {
  id:          string;
  entityType:  UploadEntityType;
  entityId:    string;
  fileName:    string;
  fileKey:     string;
  fileUrl:     string;
  mimeType:    string;
  category:    FileCategory;
  sizeBytes:   number | null;
  uploadedById:string;
  createdAt:   Date;
}

/** Request body for confirming a completed upload */
export interface ConfirmUploadRequest {
  fileKey:    string;
  entityType: UploadEntityType;
  entityId:   string;
  fileName:   string;
  mimeType:   string;   // MIME type, e.g. "image/jpeg"
  category:   FileCategory;
  sizeBytes?: number;
}

/** Query parameters for listing uploads */
export interface ListUploadsQuery {
  entityType?: UploadEntityType;
  entityId?:   string;
  category?:   FileCategory;
}
