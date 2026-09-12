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
    <div className="bg-white border border-[#E5EAEF] rounded-xl p-5 text-xs font-sans space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#E5EAEF] pb-3">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#5D87FF]" />
          <h3 className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">
            Technical Evidence Document Uploader
          </h3>
        </div>
        <span className="text-[10px] text-[#5A6A85] font-semibold">Max size: 20MB (PDF, PNG, JPG)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] uppercase font-semibold text-[#5A6A85] mb-1">
            Document Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-[#F6F9FC] border border-[#E5EAEF] rounded-lg px-3 py-2 text-xs font-semibold text-[#2A3547] focus:outline-none focus:border-[#5D87FF]"
          >
            {DOCUMENT_TYPES.map((dt) => (
              <option key={dt.value} value={dt.value}>
                {dt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-semibold text-[#5A6A85] mb-1">
            Notes / Description (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Q3 2026 Gas Assay Report"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#F6F9FC] border border-[#E5EAEF] rounded-lg px-3 py-2 text-xs text-[#2A3547] focus:outline-none focus:border-[#5D87FF]"
          />
        </div>
      </div>

      {/* File Drop Target */}
      <div className="relative border-2 border-dashed border-[#E5EAEF] rounded-xl p-6 text-center hover:border-[#5D87FF] transition bg-[#F6F9FC]">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          onChange={handleFileChange}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="space-y-2 pointer-events-none">
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#5D87FF]">
              <Loader2 className="w-5 h-5 animate-spin text-[#5D87FF]" />
              <span>Uploading technical evidence to CarbonLoop vault...</span>
            </div>
          ) : (
            <>
              <FileText className="w-8 h-8 mx-auto text-[#5D87FF]/60" />
              <p className="text-xs font-bold text-[#2A3547]">
                Click or drag file here to attach verification evidence
              </p>
              <span className="text-[10px] text-[#5A6A85] block">
                Accepted: PDF, PNG, JPG, DOCX (up to 20MB)
              </span>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-[#FA896B] bg-[#FA896B]/10 border border-[#FA896B]/30 p-3 rounded-lg font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successDoc && (
        <div className="flex items-center justify-between text-xs text-[#0EAB8B] bg-[#13DEB9]/15 border border-[#13DEB9]/30 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#13DEB9]" />
            <span className="font-bold">Uploaded successfully: {successDoc.fileName}</span>
          </div>
          <span className="text-[10px] uppercase font-bold bg-[#13DEB9]/20 px-2 py-0.5 rounded-full">
            {successDoc.status}
          </span>
        </div>
      )}
    </div>
  );
};
