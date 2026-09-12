import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UploadFileOptions {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  organizationId?: string;
  documentType?: string;
}

export interface StorageFileResult {
  storageKey: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
  url: string;
}

export interface StorageProvider {
  uploadFile(options: UploadFileOptions): Promise<StorageFileResult>;
  deleteFile(storageKey: string): Promise<boolean>;
  getFilePath(storageKey: string): string;
  exists(storageKey: string): boolean;
}

export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;
  private allowedMimeTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  private maxFileSize = 20 * 1024 * 1024; // 20 MB

  constructor(customDir?: string) {
    this.uploadDir = customDir || path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  public async uploadFile(options: UploadFileOptions): Promise<StorageFileResult> {
    if (options.buffer.length > this.maxFileSize) {
      throw new Error(`File size exceeds maximum limit of 20MB.`);
    }

    if (!this.allowedMimeTypes.includes(options.mimeType.toLowerCase())) {
      throw new Error(`Disallowed MIME type: ${options.mimeType}. Only PDF, images, and documents are permitted.`);
    }

    // Sanitize filename to prevent path traversal
    const sanitizedFileName = path.basename(options.fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const randomUuid = crypto.randomUUID();
    const storageKey = `${randomUuid}-${sanitizedFileName}`;
    const filePath = path.join(this.uploadDir, storageKey);

    // Write file securely
    await fs.promises.writeFile(filePath, options.buffer);

    // Compute SHA-256 checksum for audit integrity
    const checksum = crypto.createHash('sha256').update(options.buffer).digest('hex');

    return {
      storageKey,
      fileName: sanitizedFileName,
      mimeType: options.mimeType,
      fileSize: options.buffer.length,
      checksum,
      url: `/api/v1/documents/download/${storageKey}`,
    };
  }

  public async deleteFile(storageKey: string): Promise<boolean> {
    const safeKey = path.basename(storageKey);
    const filePath = path.join(this.uploadDir, safeKey);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  }

  public getFilePath(storageKey: string): string {
    const safeKey = path.basename(storageKey);
    return path.join(this.uploadDir, safeKey);
  }

  public exists(storageKey: string): boolean {
    const safeKey = path.basename(storageKey);
    return fs.existsSync(path.join(this.uploadDir, safeKey));
  }
}

export const defaultStorageProvider = new LocalStorageProvider();
