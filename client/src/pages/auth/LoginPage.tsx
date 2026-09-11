import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { INDUSTRIAL_IMAGES } from '@/lib/images';
import { ArrowRight, Lock, Mail, Factory, Building2, Truck, ShieldCheck } from 'lucide-react';
import { FadeUp } from '@/animations';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('supply@terracem.com');
  const [password, setPassword] = useState<string>('Password123!');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Authentication failed. Please check credentials.');
    }
    setLoading(false);
  };

  const setDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
  };

  return (
    <FadeUp className="w-full bg-[#FAF8F5] border border-[#E2DDD5] grid grid-cols-1 md:grid-cols-12 overflow-hidden shadow-sm">
      
      {/* Left Column: Real Industrial Photograph & Editorial Overlay */}
      <div className="md:col-span-6 relative min-h-[350px] md:min-h-[550px] hidden md:flex flex-col justify-end p-8 border-r border-[#E2DDD5] overflow-hidden">
        <img
          src={INDUSTRIAL_IMAGES.heroFacility}
          alt="Carbon Capture Processing Infrastructure"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171A18]/95 via-[#171A18]/50 to-transparent" />

        {/* Bottom Editorial Caption */}
        <div className="relative z-10 space-y-3 text-white">
          <span className="text-[10px] font-mono text-[#A3B899] uppercase tracking-widest block font-bold bg-white/10 px-2.5 py-1 w-fit border border-white/15">
            POST-COMBUSTION STACK TELEMETRY
          </span>
          <h3 className="text-2xl font-bold tracking-tight leading-snug">
            "Connecting industrial stack emissions directly to commercial off-takers."
          </h3>
          <p className="text-xs font-serif text-[#C5D3C1]">
            Ahmedabad Industrial Corridor • Certified Purity Exchange
          </p>
        </div>
      </div>

      {/* Right Column: Authentication Console Form */}
      <div className="md:col-span-6 p-6 sm:p-10 flex flex-col justify-between gap-6 bg-[#FAF8F5]">
        
        <div className="space-y-6">
          
          {/* Header */}
          <div className="space-y-2 border-b border-[#E2DDD5] pb-4">
            <span className="bg-[#EBE7DF] text-[#173D32] border border-[#DCD6C9] font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 inline-block">
              SECURE AUTHENTICATION CONSOLE
            </span>

            <h2 className="text-3xl font-black text-[#171A18] tracking-tight mt-2">
              Welcome back.
            </h2>
            <p className="text-xs text-[#5C6560] font-serif">
              Access facility stream listings, buyer match engine, and logistics dispatch
            </p>
          </div>

          {/* Quick Fill Demo Buttons */}
          <div className="space-y-2 bg-[#EBE7DF]/60 p-3 border border-[#DCD6C9]">
            <span className="text-[10px] font-mono text-[#173D32] font-bold uppercase tracking-wider block">
              ⚡ Quick Fill Demo Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setDemoAccount('supply@terracem.com')}
                className="p-2 bg-[#FAF8F5] hover:bg-[#173D32] hover:text-white text-[#171A18] border border-[#DCD6C9] flex items-center gap-1.5 transition-colors text-left"
              >
                <Factory className="size-3.5 text-[#173D32] shrink-0" />
                <span className="truncate font-bold">Emitter</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('procurement@greenforge.com')}
                className="p-2 bg-[#FAF8F5] hover:bg-[#173D32] hover:text-white text-[#171A18] border border-[#DCD6C9] flex items-center gap-1.5 transition-colors text-left"
              >
                <Building2 className="size-3.5 text-[#173D32] shrink-0" />
                <span className="truncate font-bold">Utilizer</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('logistics@transcarbon.com')}
                className="p-2 bg-[#FAF8F5] hover:bg-[#173D32] hover:text-white text-[#171A18] border border-[#DCD6C9] flex items-center gap-1.5 transition-colors text-left"
              >
                <Truck className="size-3.5 text-[#173D32] shrink-0" />
                <span className="truncate font-bold">Logistics</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('admin@carbonloop.io')}
                className="p-2 bg-[#FAF8F5] hover:bg-[#173D32] hover:text-white text-[#171A18] border border-[#DCD6C9] flex items-center gap-1.5 transition-colors text-left"
              >
                <ShieldCheck className="size-3.5 text-[#173D32] shrink-0" />
                <span className="truncate font-bold">Admin</span>
              </button>
            </div>
          </div>

          {/* Error Feedback */}
          {error && (
            <div className="p-3 bg-[#8C6D38]/10 border border-[#8C6D38] text-[#8C6D38] text-xs font-mono font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Work Email */}
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-[#171A18] uppercase font-bold">Work Email</Label>
              <div className="relative">
                <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6560]" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="supply@terracem.com"
                  className="pl-9 h-10 bg-[#EBE7DF] border-[#DCD6C9] text-[#171A18] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-mono text-[#171A18] uppercase font-bold">Password</Label>
                <Link to="/forgot-password" className="text-xs font-mono text-[#173D32] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6560]" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-10 bg-[#EBE7DF] border-[#DCD6C9] text-[#171A18] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#173D32] hover:bg-[#255244] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-2 border border-[#173D32]"
            >
              {loading ? 'Authenticating...' : 'Sign In to Console'} <ArrowRight className="size-4" />
            </Button>
          </form>

        </div>

        {/* Footer Link */}
        <div className="border-t border-[#E2DDD5] pt-4 text-center text-xs font-serif text-[#5C6560]">
          Don't have an industrial account?{' '}
          <Link to="/register" className="text-[#173D32] font-mono font-bold hover:underline ml-1 uppercase">
            Register Entity
          </Link>
        </div>

      </div>

    </FadeUp>
  );
};
