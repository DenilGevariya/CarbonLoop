import React from 'react';
import { FileText, Download, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ReportViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportUrl?: string | null;
  filename?: string | null;
  purityPercentage?: number;
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({
  isOpen,
  onClose,
  reportUrl,
  filename,
  purityPercentage = 99.5,
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-white border border-[#E5EAEF] p-6 rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="border-b border-[#E5EAEF] pb-4 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-base font-bold text-[#2A3547] flex items-center gap-2">
              <FileText className="size-5 text-[#5D87FF]" /> Gas Chromatography Purity Certificate
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6A85] mt-0.5">
              {filename || 'Certified_ISO_CO2_Purity_Lab_Report.pdf'}
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            {reportUrl && (
              <a
                href={reportUrl}
                download={filename || 'CO2_Lab_Report.pdf'}
                className="px-3 py-1.5 bg-[#F6F9FC] border border-[#E5EAEF] text-[#2A3547] hover:bg-[#ECF2FF] hover:text-[#5D87FF] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Download className="size-3.5" /> Download PDF
              </a>
            )}
          </div>
        </DialogHeader>

        {/* Audit Meta Bar */}
        <div className="my-4 p-3 bg-[#F6F9FC] border border-[#E5EAEF] rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-[#5A6A85] block text-[10px] uppercase font-semibold">Stated CO₂ Purity</span>
            <span className="text-sm font-extrabold text-[#13DEB9]">{purityPercentage}% ISO-Certified</span>
          </div>
          <div>
            <span className="text-[#5A6A85] block text-[10px] uppercase font-semibold">Auditing Body</span>
            <span className="font-bold text-[#2A3547]">SGS Gas Chromatography Vault</span>
          </div>
          <div>
            <span className="text-[#5A6A85] block text-[10px] uppercase font-semibold">Verification Status</span>
            <span className="inline-flex items-center gap-1 font-bold text-[#5D87FF]">
              <ShieldCheck className="size-3.5" /> Regulator Audit Passed
            </span>
          </div>
        </div>

        {/* Embedded Viewer Canvas */}
        <div className="flex-1 min-h-[400px] border border-[#E5EAEF] rounded-lg overflow-hidden bg-slate-900 relative flex items-center justify-center">
          {reportUrl ? (
            reportUrl.startsWith('data:image/') || reportUrl.endsWith('.png') || reportUrl.endsWith('.jpg') || reportUrl.endsWith('.jpeg') ? (
              <img src={reportUrl} alt="Purity Report Certificate" className="max-h-full max-w-full object-contain p-4" />
            ) : (
              <iframe
                src={reportUrl}
                title="Purity Report Document Viewer"
                className="w-full h-full border-none"
              />
            )
          ) : (
            <div className="p-8 text-center text-slate-300 space-y-2">
              <ShieldCheck className="size-12 text-[#13DEB9] mx-auto opacity-70" />
              <p className="text-sm font-bold">Standard Certified ISO Gas Assay Document</p>
              <p className="text-xs text-slate-400">Purity verification report attached to active CO₂ stream declaration.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-[#E5EAEF]">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-semibold">
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
