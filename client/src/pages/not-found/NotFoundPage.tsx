import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { FadeUp } from '@/animations';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#171A18] flex flex-col items-center justify-center p-6 text-center">
      <FadeUp className="max-w-md w-full bg-[#FAF8F5] border border-[#E2DDD5] p-8 space-y-6">
        <div className="size-14 bg-[#173D32] border border-[#3C6E5C] text-white flex items-center justify-center font-mono font-bold text-xl mx-auto">
          404
        </div>
        <div className="space-y-2">
          <span className="bg-[#EBE7DF] text-[#173D32] border border-[#DCD6C9] font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 inline-block">
            ROUTE OUT OF SCOPE
          </span>
          <h2 className="text-2xl font-bold text-[#171A18] tracking-tight mt-2">
            Pathway Not Found
          </h2>
          <p className="text-xs text-[#5C6560] font-serif">
            The requested CarbonLoop exchange route or document does not exist.
          </p>
        </div>
        <Button
          onClick={() => navigate('/')}
          className="w-full bg-[#173D32] hover:bg-[#255244] text-white font-mono text-xs font-bold uppercase tracking-wider py-3 rounded-none border border-[#173D32] flex items-center justify-center gap-2"
        >
          <ArrowLeft className="size-4" /> Return to Main Landing Page
        </Button>
      </FadeUp>
    </div>
  );
};

export default NotFoundPage;
