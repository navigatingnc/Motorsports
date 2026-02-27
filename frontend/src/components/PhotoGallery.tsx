import { useState, useCallback, useRef } from 'react';
import { uploadService } from '../services/uploadService';
import type { Upload, UploadEntityType } from '../types/upload';
import { useAuth } from '../context/AuthContext';

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatBytes = (bytes: number | null): string => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

const isImage = (mimeType: string): boolean => mimeType.startsWith('image/');

// ── Types ─────────────────────────────────────────────────────────────────────
interface UploadingFile {
  id:       string;
  name:     string;
  progress: number;
  error?:   string;
}

interface PhotoGalleryProps {
  entityType:  UploadEntityType;
  entityId:    string;
  uploads:     Upload[];
  onUploaded:  (upload: Upload) => void;
  onDeleted:   (id: string) => void;
  readOnly?:   boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────
const PhotoGallery = ({
  entityType,
  entityId,
  uploads,
  onUploaded,
  onDeleted,
  readOnly = false,
}: PhotoGalleryProps) => {
  const { user } = useAuth();
  const [dragOver, setDragOver]       = useState(false);
  const [uploading, setUploading]     = useState<UploadingFile[]>([]);
  const [lightbox, setLightbox]       = useState<Upload | null>(null);
  const [activeTab, setActiveTab]     = useState<'photos' | 'documents'>('photos');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photos    = uploads.filter(u => u.category === 'photo');
  const documents = uploads.filter(u => u.category === 'document');

  // ── Upload handler ──────────────────────────────────────────────────────────
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const newUploading: UploadingFile[] = fileArray.map(f => ({
      id:       `${Date.now()}-${f.name}`,
      name:     f.name,
      progress: 0,
    }));
    setUploading(prev => [...prev, ...newUploading]);

    await Promise.all(
      fileArray.map(async (file, idx) => {
        const trackId = newUploading[idx].id;
        const category = isImage(file.type) ? 'photo' : 'document';
        try {
          const record = await uploadService.uploadFile(
            entityType,
            entityId,
            file,
            category,
            (pct) => {
              setUploading(prev =>
                prev.map(u => u.id === trackId ? { ...u, progress: pct } : u),
              );
            },
          );
          onUploaded(record);
          setUploading(prev => prev.filter(u => u.id !== trackId));
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Upload failed';
          setUploading(prev =>
            prev.map(u => u.id === trackId ? { ...u, error: msg } : u),
          );
          // Auto-clear error after 5 s
          setTimeout(() => {
            setUploading(prev => prev.filter(u => u.id !== trackId));
          }, 5000);
        }
      }),
    );
  }, [entityType, entityId, onUploaded]);

  // ── Drag & drop ─────────────────────────────────────────────────────────────
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    void handleFiles(e.dataTransfer.files);
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      await uploadService.deleteUpload(id);
      onDeleted(id);
    } catch {
      // silently ignore
    } finally {
      setDeleteConfirm(null);
    }
  };

  const canDelete = (upload: Upload) =>
    user?.role === 'admin' || upload.uploadedById === user?.id;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="gallery-container">
      {/* Tab bar */}
      <div className="gallery-tabs">
        <button
          className={`gallery-tab${activeTab === 'photos' ? ' gallery-tab--active' : ''}`}
          onClick={() => setActiveTab('photos')}
        >
          Photos
          {photos.length > 0 && (
            <span className="gallery-tab-badge">{photos.length}</span>
          )}
        </button>
        <button
          className={`gallery-tab${activeTab === 'documents' ? ' gallery-tab--active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
          {documents.length > 0 && (
            <span className="gallery-tab-badge">{documents.length}</span>
          )}
        </button>
      </div>

      {/* Drop zone (hidden in readOnly mode) */}
      {!readOnly && (
        <div
          className={`gallery-dropzone${dragOver ? ' gallery-dropzone--active' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          aria-label="Upload files"
        >
          <div className="gallery-dropzone-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className="gallery-dropzone-text">
            Drag &amp; drop photos or documents here, or <span className="gallery-dropzone-link">browse files</span>
          </p>
          <p className="gallery-dropzone-hint">
            Images: JPEG, PNG, GIF, WebP, HEIC &nbsp;|&nbsp; Documents: PDF, Word, Excel, CSV &nbsp;|&nbsp; Max 50 MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files && void handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Upload progress */}
      {uploading.length > 0 && (
        <div className="gallery-progress-list">
          {uploading.map(u => (
            <div key={u.id} className={`gallery-progress-item${u.error ? ' gallery-progress-item--error' : ''}`}>
              <span className="gallery-progress-name">{u.name}</span>
              {u.error ? (
                <span className="gallery-progress-error">{u.error}</span>
              ) : (
                <div className="gallery-progress-bar-wrap">
                  <div className="gallery-progress-bar" style={{ width: `${u.progress}%` }} />
                  <span className="gallery-progress-pct">{u.progress}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Photos grid */}
      {activeTab === 'photos' && (
        <div className="gallery-section">
          {photos.length === 0 ? (
            <p className="gallery-empty">No photos yet.{!readOnly && ' Upload some using the drop zone above.'}</p>
          ) : (
            <div className="gallery-grid">
              {photos.map(photo => (
                <div key={photo.id} className="gallery-item">
                  <div
                    className="gallery-thumb-wrap"
                    onClick={() => setLightbox(photo)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setLightbox(photo)}
                    aria-label={`View ${photo.fileName}`}
                  >
                    <img
                      src={photo.fileUrl}
                      alt={photo.fileName}
                      className="gallery-thumb"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2NjYyIgZD0iTTIxIDE5VjVjMC0xLjEtLjktMi0yLTJINWMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMnpNOC41IDEzLjVsIDIuNSAzLjAxTDE0LjUgMTJsNC41IDZINWwzLjUtNC41eiIvPjwvc3ZnPg==';
                      }}
                    />
                    <div className="gallery-thumb-overlay">
                      <span className="gallery-thumb-name">{photo.fileName}</span>
                    </div>
                  </div>
                  <div className="gallery-item-meta">
                    <span className="gallery-item-size">{formatBytes(photo.sizeBytes)}</span>
                    <span className="gallery-item-date">{formatDate(photo.createdAt)}</span>
                    {canDelete(photo) && !readOnly && (
                      deleteConfirm === photo.id ? (
                        <div className="gallery-delete-confirm">
                          <button
                            className="btn-danger-sm"
                            onClick={() => void handleDelete(photo.id)}
                          >
                            Confirm
                          </button>
                          <button
                            className="btn-ghost-sm"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="gallery-delete-btn"
                          onClick={() => setDeleteConfirm(photo.id)}
                          aria-label="Delete photo"
                          title="Delete"
                        >
                          ×
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Documents list */}
      {activeTab === 'documents' && (
        <div className="gallery-section">
          {documents.length === 0 ? (
            <p className="gallery-empty">No documents yet.{!readOnly && ' Upload some using the drop zone above.'}</p>
          ) : (
            <div className="gallery-doc-list">
              {documents.map(doc => (
                <div key={doc.id} className="gallery-doc-item">
                  <div className="gallery-doc-icon">
                    {doc.mimeType === 'application/pdf' ? '📄' :
                     doc.mimeType.includes('word')      ? '📝' :
                     doc.mimeType.includes('excel') || doc.mimeType.includes('spreadsheet') ? '📊' :
                     '📎'}
                  </div>
                  <div className="gallery-doc-info">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gallery-doc-name"
                    >
                      {doc.fileName}
                    </a>
                    <div className="gallery-doc-meta">
                      <span>{formatBytes(doc.sizeBytes)}</span>
                      <span>{formatDate(doc.createdAt)}</span>
                      {doc.uploadedBy && (
                        <span>by {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}</span>
                      )}
                    </div>
                  </div>
                  {canDelete(doc) && !readOnly && (
                    deleteConfirm === doc.id ? (
                      <div className="gallery-delete-confirm">
                        <button
                          className="btn-danger-sm"
                          onClick={() => void handleDelete(doc.id)}
                        >
                          Confirm
                        </button>
                        <button
                          className="btn-ghost-sm"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="gallery-delete-btn"
                        onClick={() => setDeleteConfirm(doc.id)}
                        aria-label="Delete document"
                        title="Delete"
                      >
                        ×
                      </button>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="gallery-lightbox"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.fileName}
        >
          <div
            className="gallery-lightbox-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="gallery-lightbox-close"
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >
              ×
            </button>
            <img
              src={lightbox.fileUrl}
              alt={lightbox.fileName}
              className="gallery-lightbox-img"
            />
            <div className="gallery-lightbox-caption">
              <span>{lightbox.fileName}</span>
              <span>{formatBytes(lightbox.sizeBytes)}</span>
              <span>{formatDate(lightbox.createdAt)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
