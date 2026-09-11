import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Construction, Layers } from 'lucide-react';
import { FadeUp } from '@/animations';

interface FeaturePlaceholderProps {
  title: string;
  category?: string;
  description: string;
  expectedCapabilities: string[];
  icon?: React.ElementType;
}

export const FeaturePlaceholder: React.FC<FeaturePlaceholderProps> = ({
  title,
  category = 'CarbonLoop Subsystem',
  description,
  expectedCapabilities,
  icon: Icon = Layers,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6 bg-[#F7F5EF]">
      <FadeUp className="max-w-2xl w-full">
        <div className="bg-[#FAF8F5] border border-[#E2DDD5] p-8 space-y-6 relative overflow-hidden">
          
          <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-4">
            <span className="bg-[#EBE7DF] text-[#173D32] border border-[#DCD6C9] font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 flex items-center gap-1.5">
              <Sparkles className="size-3 text-[#173D32]" /> Foundation Engine Operational
            </span>
            <span className="text-xs text-[#5C6560] font-mono uppercase">{category}</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#173D32] text-white">
                <Icon className="size-5" />
              </div>
              <h3 className="text-2xl font-bold text-[#171A18]">
                {title}
              </h3>
            </div>
            <p className="text-sm font-serif text-[#5C6560] leading-relaxed">
              {description}
            </p>
          </div>

          <div className="p-4 bg-[#EBE7DF]/60 border border-[#DCD6C9] space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 font-bold text-[#173D32] uppercase">
              <Construction className="size-4" /> Core Engine Functionalities
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[#2B302C]">
              {expectedCapabilities.map((cap, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="size-1.5 bg-[#173D32] inline-block" />
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="bg-[#EBE7DF] hover:bg-[#E2DDD5] text-[#171A18] border-[#DCD6C9] font-mono text-xs font-bold uppercase"
            >
              <ArrowLeft className="size-4 mr-2" /> Back
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="bg-[#173D32] hover:bg-[#255244] text-white font-mono text-xs font-bold uppercase"
            >
              Return to Landing Page
            </Button>
          </div>

        </div>
      </FadeUp>
    </div>
  );
};
