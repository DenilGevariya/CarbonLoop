import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrganizationDocuments, useVerificationQueue } from '@/features/verification/hooks/useVerification';
import { VerificationBadge } from '@/features/verification/components/VerificationBadge';
import { DocumentUploader } from '@/features/verification/components/DocumentUploader';
import { verificationApi } from '@/features/verification/api/verificationApi';
import { ShieldCheck, FileText, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const OrganizationVerificationPage: React.FC = () => {
  const { activeOrg } = useAuth();
  const orgId = activeOrg?.organizationId || '';
  const orgName = activeOrg?.organizationName || 'Organization';

  const { documents, loading: docsLoading, refetch: refetchDocs } = useOrganizationDocuments(orgId);
  const { items: myRequests, loading: reqsLoading, refetch: refetchReqs } = useVerificationQueue(undefined, undefined, orgId);

  const [verificationType, setVerificationType] = useState<'ORGANIZATION' | 'FACILITY' | 'CO2_PURITY' | 'TECHNICAL_SPECIFICATION'>('ORGANIZATION');
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleApplyVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;

    setSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      await verificationApi.submitRequest({
        organizationId: orgId,
        documentId: selectedDocId || undefined,
        verificationType,
        notes,
      });

      setSubmitSuccess('Verification request submitted successfully. A network reviewer will inspect your evidence.');
      setNotes('');
      refetchReqs();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit verification request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2DDD5] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#173D32]/10 text-[#173D32] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>CARBONLOOP TRUST NETWORK</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#171A18] tracking-tight">
            Organization Verification & Technical Vault
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage certified gas chromatography assay reports, corporate licenses, and submit evidence for reviewer verification.
          </p>
        </div>

        <div>
          <VerificationBadge
            status={activeOrg ? 'VERIFIED' : 'UNVERIFIED'}
            entityName={orgName}
            size="md"
          />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Apply for Verification & Upload */}
        <div className="lg:col-span-2 space-y-6">
          <DocumentUploader
            organizationId={orgId}
            onUploadSuccess={() => {
              refetchDocs();
            }}
          />

          {/* Submit Verification Form */}
          <form onSubmit={handleApplyVerification} className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#E2DDD5] pb-3">
              <Send className="w-4 h-4 text-[#173D32]" />
              <h3 className="text-xs font-bold text-[#171A18] uppercase tracking-wider">
                Submit Evidence for Reviewer Verification
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                  Verification Target Type
                </label>
                <select
                  value={verificationType}
                  onChange={(e) => setVerificationType(e.target.value as any)}
                  className="w-full bg-[#F7F5EF] border border-[#E2DDD5] rounded px-3 py-2 text-xs font-bold text-[#171A18] focus:outline-none focus:border-[#173D32]"
                >
                  <option value="ORGANIZATION">Organization Commercial Identity</option>
                  <option value="FACILITY">Facility & Plant Location</option>
                  <option value="CO2_PURITY">CO₂ Chemical Stream Purity Assay</option>
                  <option value="TECHNICAL_SPECIFICATION">Technical Stream Specification</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                  Attach Evidence Document
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full bg-[#F7F5EF] border border-[#E2DDD5] rounded px-3 py-2 text-xs font-bold text-[#171A18] focus:outline-none focus:border-[#173D32]"
                >
                  <option value="">-- Select from Uploaded Vault --</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fileName} ({d.documentType})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                Submission Notes / Context
              </label>
              <textarea
                rows={3}
                placeholder="Explain the technical evidence attached (e.g. Certified lab assay report conducted on 01 Sep 2026)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#F7F5EF] border border-[#E2DDD5] rounded p-3 text-xs text-[#171A18] focus:outline-none focus:border-[#173D32]"
              />
            </div>

            {submitSuccess && (
              <div className="flex items-center gap-2 text-xs text-[#173D32] bg-[#173D32]/10 border border-[#173D32]/30 p-3 rounded font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}

            {submitError && (
              <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2.5 bg-[#173D32] text-[#F7F5EF] font-bold text-xs rounded hover:bg-[#123027] transition flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Request...' : 'Submit Request to Verification Queue'}</span>
              </button>
            </div>
          </form>

          {/* Uploaded Vault Documents List */}
          <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#173D32]" />
                <h3 className="text-xs font-bold text-[#171A18] uppercase tracking-wider">
                  Organization Document Vault ({documents.length})
                </h3>
              </div>
            </div>

            {docsLoading ? (
              <div className="text-xs text-neutral-500 py-4 text-center">Loading document vault...</div>
            ) : documents.length === 0 ? (
              <div className="text-xs text-neutral-500 italic py-4 text-center">
                No documents uploaded yet. Use the uploader above to attach technical evidence.
              </div>
            ) : (
              <div className="divide-y divide-[#E2DDD5]/60">
                {documents.map((doc) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="space-y-0.5 max-w-md">
                      <p className="font-bold text-[#171A18] truncate">{doc.fileName}</p>
                      <span className="text-[10px] text-neutral-500 block">
                        Type: <strong className="text-neutral-700">{doc.documentType}</strong> | Size: {(doc.fileSize / 1024).toFixed(0)} KB
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-neutral-200 text-neutral-800">
                        {doc.status}
                      </span>
                      <a
                        href={`http://localhost:5000/api/v1/documents/download/${doc.storageKey}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-[#173D32]/10 text-[#173D32] border border-[#173D32]/20 rounded font-bold text-[10px] hover:bg-[#173D32]/20"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Verification Requests History */}
        <div className="space-y-6">
          <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#E2DDD5] pb-3">
              <Clock className="w-4 h-4 text-[#173D32]" />
              <h3 className="text-xs font-bold text-[#171A18] uppercase tracking-wider">
                Verification Request History ({myRequests.length})
              </h3>
            </div>

            {reqsLoading ? (
              <div className="text-xs text-neutral-500 py-4 text-center">Loading requests...</div>
            ) : myRequests.length === 0 ? (
              <div className="text-xs text-neutral-500 italic py-4 text-center">
                No verification requests submitted.
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req) => (
                  <div key={req.id} className="bg-[#F7F5EF] border border-[#E2DDD5] p-3.5 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[#173D32]">
                        {req.verificationType}
                      </span>
                      <VerificationBadge status={req.status} size="sm" showPopoverOnClick={false} />
                    </div>

                    <div className="text-xs space-y-1 text-neutral-700">
                      {req.documentName && (
                        <p className="text-[10px] text-neutral-600 truncate">
                          Evidence: <strong>{req.documentName}</strong>
                        </p>
                      )}
                      <p className="text-[10px] text-neutral-500">
                        Submitted: {new Date(req.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    {req.reviewNotes && (
                      <div className="text-[10px] bg-white p-2 rounded border border-[#E2DDD5] text-neutral-800">
                        <strong>Reviewer Note:</strong> "{req.reviewNotes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationVerificationPage;
