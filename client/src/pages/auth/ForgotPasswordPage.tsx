import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft } from 'lucide-react';
import { FadeUp } from '@/animations';

export const ForgotPasswordPage: React.FC = () => {
  return (
    <FadeUp className="max-w-md mx-auto">
      <div className="bg-[#FAF8F5] border border-[#E2DDD5] p-8 space-y-6">
        <div className="space-y-2 text-center border-b border-[#E2DDD5] pb-6">
          <span className="bg-[#EBE7DF] text-[#173D32] border border-[#DCD6C9] font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 inline-block">
            AUTHENTICATION RECOVERY
          </span>
          <h2 className="text-2xl font-bold text-[#171A18] tracking-tight mt-2">
            Reset Account Password
          </h2>
          <p className="text-xs text-[#5C6560] font-serif">
            Enter your registered industrial work email to receive password reset instructions
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-mono text-[#171A18] uppercase">Work Email</Label>
            <div className="relative">
              <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6560]" />
              <Input
                type="email"
                placeholder="supply@terracem.com"
                className="pl-9 bg-[#EBE7DF] border-[#DCD6C9] text-[#171A18] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                required
              />
            </div>
          </div>

          <Button className="w-full bg-[#173D32] hover:bg-[#255244] text-white font-mono text-xs font-bold uppercase tracking-wider py-3 rounded-none border border-[#173D32]">
            Send Reset Instructions
          </Button>
        </div>

        <div className="justify-center text-center text-xs text-[#5C6560] border-t border-[#E2DDD5] pt-4">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-[#173D32] font-mono font-bold hover:underline uppercase">
            <ArrowLeft className="size-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </FadeUp>
  );
};
