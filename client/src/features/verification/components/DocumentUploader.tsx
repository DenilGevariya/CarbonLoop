import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { documentApi, type DocumentItem } from '../api/documentApi';

interface DocumentUploaderProps {
  organizationId: string;
  facilityId?: string;
  listingId?: string;
  onUploadSuccess?: (doc: DocumentItem) => void;
}

const DOCUMENT_TYPES = [
  { value: 'CO2_PURITY_CERTIFICATE', label: 'CO₂ Purity Assay Certificate' },
  { value: 'LAB_REPORT', label: 'Certified Laboratory Test Report' },
  { value: 'TECHNICAL_SPECIFICATION', label: 'Technical Stream Specification' },
  { value: 'COMPANY_REGISTRATION', label: 'Company Commercial License / Registration' },
  { value: 'FACILITY_LICENSE', label: 'Facility Industrial Operating License' },
  { value: 'SAFETY_CERTIFICATE', label: 'Safety & Pressure Vessel Certificate' },
  { value: 'ENVIRONMENTAL_CERTIFICATE', label: 'Environmental Operating License' },
  { value: 'OTHER', label: 'Other Technical Documentation' },
];

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  organizationId,
  facilityId,
  listingId,
  onUploadSuccess,
}) => {
  const [selectedType, setSelectedType] = useState('CO2_PURITY_CERTIFICATE');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successDoc, setSuccessDoc] = useState<DocumentItem | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setError('File size exceeds maximum allowed limit of 20MB.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessDoc(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];

        const uploaded = await documentApi.uploadBase64({
          organizationId,
          facilityId,
          listingId,
          documentType: selectedType,
          fileName: file.name,
          fileBase64: base64String,
          mimeType: file.type || 'application/pdf',
          description,
        });

        setSuccessDoc(uploaded);
        if (onUploadSuccess) onUploadSuccess(uploaded);
      };
      reader.onerror = () => {
        setError('Failed to read file contents.');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-5 font-mono space-y-4 shadow-2xs">
      <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-3">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#173D32]" />
          <h3 className="text-xs font-bold text-[#171A18] uppercase tracking-wider">
            Technical Evidence Document Uploader
          </h3>
        </div>
        <span className="text-[10px] text-neutral-500">Max size: 20MB (PDF, PNG, JPG)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
            Document Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-[#F7F5EF] border border-[#E2DDD5] rounded px-3 py-2 text-xs font-bold text-[#171A18] focus:outline-none focus:border-[#173D32]"
          >
            {DOCUMENT_TYPES.map((dt) => (
              <option key={dt.value} value={dt.value}>
                {dt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
            Notes / Description (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Q3 2026 Gas Assay Report"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#F7F5EF] border border-[#E2DDD5] rounded px-3 py-2 text-xs text-[#171A18] focus:outline-none focus:border-[#173D32]"
          />
        </div>
      </div>

      {/* File Drop Target */}
      <div className="relative border-2 border-dashed border-[#E2DDD5] rounded-lg p-6 text-center hover:border-[#173D32] transition bg-[#F7F5EF]">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          onChange={handleFileChange}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="space-y-2 pointer-events-none">
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#173D32]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Uploading technical evidence to CarbonLoop vault...</span>
            </div>
          ) : (
            <>
              <FileText className="w-8 h-8 mx-auto text-[#173D32]/60" />
              <p className="text-xs font-bold text-[#171A18]">
                Click or drag file here to attach verification evidence
              </p>
              <span className="text-[10px] text-neutral-500 block">
                Accepted: PDF, PNG, JPG, DOCX (up to 20MB)
              </span>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successDoc && (
        <div className="flex items-center justify-between text-xs text-[#173D32] bg-[#173D32]/5 border border-[#173D32]/20 p-3 rounded">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#173D32]" />
            <span className="font-bold">Uploaded successfully: {successDoc.fileName}</span>
          </div>
          <span className="text-[10px] uppercase font-bold bg-[#173D32]/10 px-2 py-0.5 rounded">
            {successDoc.status}
          </span>
        </div>
      )}
    </div>
  );
};
