import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVerificationDetail } from '@/features/verification/hooks/useVerification';
import { VerificationBadge } from '@/features/verification/components/VerificationBadge';
import { VerificationHistoryTimeline } from '@/features/verification/components/VerificationHistoryTimeline';
import { verificationApi } from '@/features/verification/api/verificationApi';
import { ShieldCheck, ArrowLeft, FileText, CheckCircle2, AlertCircle, Clock, Send, AlertTriangle } from 'lucide-react';

export const AdminVerificationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { detail, loading, error, refetch } = useVerificationDetail(id);

  const [reviewAction, setReviewAction] = useState<'START' | 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES'>('APPROVE');
  const [reviewNotes, setReviewNotes] = useState('');
  const [expiryMonths, setExpiryMonths] = useState(12);
  const [verifiedPurity, setVerifiedPurity] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [processSuccess, setProcessSuccess] = useState<string | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="p-8 font-mono text-center text-xs text-neutral-500">
        Loading reviewer workspace context...
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-8 font-mono text-center space-y-4">
        <div className="text-sm font-bold text-red-700 bg-red-50 p-4 rounded border border-red-200">
          {error || 'Verification request not found.'}
        </div>
        <button
          onClick={() => navigate('/admin/verification')}
          className="px-4 py-2 bg-[#173D32] text-white font-bold text-xs rounded"
        >
          Return to Review Queue
        </button>
      </div>
    );
  }

  const { request, documents, qualityRecords, history, ruleCheck } = detail;

  const handleStartReview = async () => {
    setProcessing(true);
    setProcessError(null);
    try {
      await verificationApi.processReview(request.id, { action: 'START' });
      refetch();
    } catch (err: any) {
      setProcessError(err.message || 'Failed to start review.');
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setProcessSuccess(null);
    setProcessError(null);

    try {
      await verificationApi.processReview(request.id, {
        action: reviewAction,
        notes: reviewNotes,
        reason: reviewNotes,
        expiryMonths: expiryMonths,
        latestVerifiedPurity: verifiedPurity ? parseFloat(verifiedPurity) : undefined,
      });

      setProcessSuccess(`Successfully updated verification request to ${reviewAction}.`);
      refetch();
    } catch (err: any) {
      setProcessError(err.message || 'Failed to process review decision.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-mono">
      {/* Back Button & Top Bar */}
      <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-4">
        <button
          onClick={() => navigate('/admin/verification')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#173D32] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Verification Queue</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500">Request ID: <strong className="text-neutral-800">{request.id.substring(0, 8)}</strong></span>
          <VerificationBadge status={request.status} size="md" />
        </div>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#171A18] tracking-tight">
          Reviewer Assessment Workspace
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Inspect submitted technical evidence, compare declared vs verified purity, and issue binding network verification decisions.
        </p>
      </div>

      {/* Start Review Banner if SUBMITTED */}
      {request.status === 'SUBMITTED' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900">Request is currently pending reviewer assignment.</p>
              <span className="text-[10px] text-amber-700">Click below to mark this request as UNDER REVIEW.</span>
            </div>
          </div>
          <button
            onClick={handleStartReview}
            disabled={processing}
            className="px-3.5 py-2 bg-amber-700 text-white font-bold text-xs rounded hover:bg-amber-800 transition"
          >
            {processing ? 'Assigning...' : 'Start Active Assessment'}
          </button>
        </div>
      )}

      {/* 3-Column Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Entity Context (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#E2DDD5] pb-3">
              <ShieldCheck className="w-4 h-4 text-[#173D32]" />
              <h3 className="text-xs font-bold text-[#171A18] uppercase tracking-wider">
                Verification Target Context
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Organization</span>
                <p className="font-bold text-[#171A18] text-sm">{request.organizationName || 'N/A'}</p>
              </div>

              {request.facilityName && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">Facility / Plant</span>
                  <p className="font-semibold text-neutral-800">{request.facilityName}</p>
                </div>
              )}

              {request.listingCode && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">CO₂ Listing Code</span>
                  <p className="font-bold text-[#173D32]">{request.listingCode}</p>
                </div>
              )}

              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Requested Type</span>
                <p className="font-bold text-[#173D32] uppercase">{request.verificationType}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Submitted By</span>
                <p className="font-semibold text-neutral-800">{request.requestedByName || 'Organization Admin'}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Submission Date</span>
                <p className="text-neutral-700">
                  {new Date(request.submittedAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Rule Check Status */}
            <div className="border-t border-[#E2DDD5] pt-3 space-y-2">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">Verification Rules Engine</span>
              {ruleCheck.valid ? (
                <div className="flex items-center gap-2 text-xs text-[#173D32] bg-[#173D32]/10 p-2.5 rounded font-bold border border-[#173D32]/20">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>All required evidence documents attached!</span>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-200">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Missing Required Evidence</span>
                    <span className="text-[10px] text-amber-700">
                      Required document types: {ruleCheck.missingDocumentTypes.join(', ')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Audit Trail Timeline */}
          <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-5 space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold text-[#171A18] uppercase tracking-wider border-b border-[#E2DDD5] pb-3">
              Immutable Verification History
            </h3>
            <VerificationHistoryTimeline history={history} />
          </div>
        </div>

        {/* CENTER COLUMN: Evidence Documents & Quality Records (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#E2DDD5] pb-3">
              <FileText className="w-4 h-4 text-[#173D32]" />
              <h3 className="text-xs font-bold text-[#171A18] uppercase tracking-wider">
                Submitted Technical Documents ({documents.length})
              </h3>
            </div>

            {documents.length === 0 ? (
              <div className="text-xs text-neutral-500 italic py-4 text-center">
                No documents uploaded for this request.
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="bg-[#F7F5EF] border border-[#E2DDD5] p-3.5 rounded space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-[#171A18] break-all">{doc.fileName}</p>
                        <span className="text-[10px] text-neutral-500 block uppercase font-bold text-[#173D32]">
                          {doc.documentType}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-neutral-200 text-neutral-800 shrink-0">
                        {doc.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-neutral-500 border-t border-[#E2DDD5]/60 pt-2">
                      <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
                      <a
                        href={`http://localhost:5000/api/v1/documents/download/${doc.fileName}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#173D32] font-bold hover:underline"
                      >
                        Inspect / Download File
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical Quality Records */}
          {qualityRecords && qualityRecords.length > 0 && (
            <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-5 space-y-4 shadow-2xs">
              <h3 className="text-xs font-bold text-[#171A18] uppercase tracking-wider border-b border-[#E2DDD5] pb-3">
                Historical Quality Test Assay Records
              </h3>
              <div className="space-y-3">
                {qualityRecords.map((qr) => (
                  <div key={qr.id} className="bg-[#F7F5EF] border border-[#E2DDD5] p-3 rounded text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>Verified Assay Purity:</span>
                      <span className="text-[#173D32]">{qr.purityPercentage}%</span>
                    </div>
                    <div className="text-[10px] text-neutral-600">
                      <span>Lab: <strong>{qr.laboratoryName}</strong></span> | <span>Date: {qr.measurementDate}</span>
                    </div>
                    {qr.notes && <p className="text-[10px] text-neutral-500 italic font-mono">"{qr.notes}"</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Review Decision Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <form onSubmit={handleProcessReview} className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#E2DDD5] pb-3">
              <Send className="w-4 h-4 text-[#173D32]" />
              <h3 className="text-xs font-bold text-[#171A18] uppercase tracking-wider">
                Review Decision Panel
              </h3>
            </div>

            {/* Decision Action Selector */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                Review Decision Action
              </label>
              <select
                value={reviewAction}
                onChange={(e) => setReviewAction(e.target.value as any)}
                className="w-full bg-[#F7F5EF] border border-[#E2DDD5] rounded px-3 py-2 text-xs font-bold text-[#171A18] focus:outline-none focus:border-[#173D32]"
              >
                <option value="APPROVE">✓ APPROVE VERIFICATION</option>
                <option value="REQUEST_CHANGES">⚠ REQUEST CHANGES / ADDITIONAL EVIDENCE</option>
                <option value="REJECT">✕ REJECT VERIFICATION</option>
              </select>
            </div>

            {/* Expiry Months & Verified Purity (If Approving) */}
            {reviewAction === 'APPROVE' && (
              <div className="space-y-3 bg-[#173D32]/5 p-3 rounded border border-[#173D32]/10">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                    Verification Validity (Months)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={36}
                    value={expiryMonths}
                    onChange={(e) => setExpiryMonths(parseInt(e.target.value, 10) || 12)}
                    className="w-full bg-[#F7F5EF] border border-[#E2DDD5] rounded px-3 py-1.5 text-xs font-bold text-[#171A18]"
                  />
                </div>

                {request.listingId && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#173D32] mb-1">
                      Latest Verified Lab Assay Purity (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 99.47"
                      value={verifiedPurity}
                      onChange={(e) => setVerifiedPurity(e.target.value)}
                      className="w-full bg-[#F7F5EF] border border-[#E2DDD5] rounded px-3 py-1.5 text-xs font-bold text-[#171A18]"
                    />
                    <span className="text-[9px] text-neutral-500 block mt-1">
                      Note: Listing declared purity will NOT be overwritten. Verified assay purity will be stored separately.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Review Notes */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                Reviewer Notes / Feedback {reviewAction !== 'APPROVE' && <span className="text-red-700">* Required</span>}
              </label>
              <textarea
                rows={4}
                placeholder="Provide precise review rationale, document verification findings, or requested changes..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full bg-[#F7F5EF] border border-[#E2DDD5] rounded p-3 text-xs text-[#171A18] focus:outline-none focus:border-[#173D32]"
              />
            </div>

            {processSuccess && (
              <div className="flex items-center gap-2 text-xs text-[#173D32] bg-[#173D32]/10 border border-[#173D32]/30 p-3 rounded font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{processSuccess}</span>
              </div>
            )}

            {processError && (
              <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{processError}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={processing}
                className={`w-full py-2.5 font-bold text-xs rounded transition flex items-center justify-center gap-2 disabled:opacity-50 ${
                  reviewAction === 'APPROVE'
                    ? 'bg-[#173D32] text-white hover:bg-[#123027]'
                    : reviewAction === 'REQUEST_CHANGES'
                    ? 'bg-amber-700 text-white hover:bg-amber-800'
                    : 'bg-red-700 text-white hover:bg-red-800'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>{processing ? 'Processing Decision...' : `Submit Review Decision (${reviewAction})`}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminVerificationDetailPage;
