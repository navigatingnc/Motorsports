import { Request, Response } from 'express';
/**
 * Generate a presigned PUT URL so the client can upload directly to S3.
 * The file is NOT yet recorded in the database — call /confirm after upload.
 */
export declare const getPresignedUploadUrl: (req: Request, res: Response) => Promise<void>;
/**
 * After the client has PUT the file to S3, call this endpoint to persist
 * the upload metadata in the database.
 */
export declare const confirmUpload: (req: Request, res: Response) => Promise<void>;
/**
 * List upload records, optionally filtered by entityType, entityId, or category.
 */
export declare const listUploads: (req: Request, res: Response) => Promise<void>;
/**
 * Generate a short-lived presigned GET URL for downloading/viewing a file.
 */
export declare const getDownloadUrl: (req: Request, res: Response) => Promise<void>;
/**
 * Delete a file from S3 and remove its metadata record from the database.
 * Only the uploader or an admin may delete a file.
 */
export declare const deleteUpload: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=upload.controller.d.ts.map