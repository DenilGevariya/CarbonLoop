import { Response } from 'express';
import fs from 'fs';
import { AuthenticatedRequest } from '../auth/auth.types';
import { DocumentService } from './document.service';
import { defaultStorageProvider } from '../../services/storage/storage.service';

export class DocumentController {
  private service: DocumentService;

  constructor() {
    this.service = new DocumentService();
  }

  public uploadDocument = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
      }

      let fileName: string;
      let mimeType: string;
      let buffer: Buffer;

      if ((req as any).file) {
        const file = (req as any).file;
        fileName = file.originalname;
        mimeType = file.mimetype;
        buffer = file.buffer;
      } else if (req.body.fileBase64 && req.body.fileName) {
        fileName = req.body.fileName;
        mimeType = req.body.mimeType || 'application/pdf';
        buffer = Buffer.from(req.body.fileBase64, 'base64');
      } else {
        return res.status(400).json({ success: false, error: { code: 'INVALID_FILE', message: 'No file uploaded.' } });
      }

      const { organizationId, facilityId, listingId, documentType, description } = req.body;

      if (!organizationId) {
        return res.status(400).json({ success: false, error: { code: 'ORG_ID_REQUIRED', message: 'organizationId is required.' } });
      }

      const doc = await this.service.uploadDocument({
        organizationId: organizationId as string,
        facilityId: facilityId ? (facilityId as string) : undefined,
        listingId: listingId ? (listingId as string) : undefined,
        uploadedBy: userId,
        documentType: (documentType as string) || 'CO2_PURITY_CERTIFICATE',
        fileName,
        mimeType,
        buffer,
        description: description ? (description as string) : undefined,
      });

      return res.status(201).json({ success: true, data: doc });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: { code: 'UPLOAD_ERROR', message: err.message } });
    }
  };

  public downloadDocument = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const storageKey = req.params.storageKey as string;
      const doc = await this.service.getByStorageKey(storageKey);

      if (!doc) {
        return res.status(404).json({ success: false, error: { code: 'FILE_NOT_FOUND', message: 'Document not found.' } });
      }

      const filePath = defaultStorageProvider.getFilePath(storageKey);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, error: { code: 'FILE_MISSING', message: 'File not found on storage.' } });
      }

      res.setHeader('Content-Type', doc.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${doc.fileName}"`);
      const stream = fs.createReadStream(filePath);
      return stream.pipe(res);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'DOWNLOAD_ERROR', message: err.message } });
    }
  };

  public getById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const doc = await this.service.getById(id);
      if (!doc) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found.' } });
      }
      return res.json({ success: true, data: doc });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: err.message } });
    }
  };

  public listByOrganization = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const organizationId = req.params.organizationId as string;
      const docs = await this.service.listByOrganization(organizationId);
      return res.json({ success: true, data: docs });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: err.message } });
    }
  };

  public createQualityRecord = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const listingId = req.params.listingId as string;
      const userId = req.user?.userId;
      const { documentId, purityPercentage, measurementDate, laboratoryName, testMethod, sampleReference, notes } = req.body;

      if (!purityPercentage || !measurementDate || !laboratoryName) {
        return res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'purityPercentage, measurementDate, and laboratoryName are required.' } });
      }

      const record = await this.service.createQualityRecord({
        listingId,
        documentId: documentId ? (documentId as string) : undefined,
        purityPercentage: parseFloat(purityPercentage),
        measurementDate: measurementDate as string,
        laboratoryName: laboratoryName as string,
        testMethod: testMethod ? (testMethod as string) : undefined,
        sampleReference: sampleReference ? (sampleReference as string) : undefined,
        notes: notes ? (notes as string) : undefined,
        verifiedBy: userId,
      });

      return res.status(201).json({ success: true, data: record });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: { code: 'QUALITY_RECORD_ERROR', message: err.message } });
    }
  };

  public getQualityRecords = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const listingId = req.params.listingId as string;
      const records = await this.service.getQualityRecordsByListing(listingId);
      return res.json({ success: true, data: records });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: err.message } });
    }
  };
}
