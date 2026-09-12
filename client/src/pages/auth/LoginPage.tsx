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
    <FadeUp className="w-full bg-white border border-[#E5EAEF] rounded-2xl grid grid-cols-1 md:grid-cols-12 overflow-hidden shadow-lg">
      
      {/* Left Column: Industrial Photography & Overlay */}
      <div className="md:col-span-6 relative min-h-[350px] md:min-h-[550px] hidden md:flex flex-col justify-end p-8 border-r border-[#E5EAEF] overflow-hidden">
        <img
          src={INDUSTRIAL_IMAGES.heroFacility}
          alt="Carbon Capture Processing Infrastructure"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A3547]/95 via-[#2A3547]/50 to-transparent" />

        {/* Bottom Glassmorphic Caption */}
        <div className="relative z-10 space-y-3 text-white">
          <span className="text-[10px] font-bold text-[#13DEB9] uppercase tracking-wider block bg-white/10 px-3 py-1 rounded-md w-fit backdrop-blur-sm border border-white/15">
            POST-COMBUSTION STACK TELEMETRY
          </span>
          <h3 className="text-2xl font-bold tracking-tight leading-snug text-white">
            Connecting industrial stack emissions directly to commercial off-takers.
          </h3>
          <p className="text-xs text-[#949C96] font-medium">
            Gujarat Industrial Corridor • Certified ISO 14064 Exchange
          </p>
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="md:col-span-6 p-6 sm:p-10 flex flex-col justify-between gap-6 bg-white">
        
        <div className="space-y-6">
          
          {/* Header */}
          <div className="space-y-2 border-b border-[#E5EAEF] pb-4">
            <span className="px-3 py-1 rounded-md bg-[#ECF2FF] border border-[#5D87FF]/20 text-[#5D87FF] text-[10px] font-bold uppercase tracking-wider inline-block">
              SECURE CONSOLE AUTHENTICATION
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#2A3547] tracking-tight mt-1">
              Welcome back.
            </h2>
            <p className="text-xs text-[#5A6A85] font-medium">
              Access facility stream listings, buyer match engine, and logistics dispatch
            </p>
          </div>

          {/* Quick Fill Demo Accounts */}
          <div className="space-y-2 bg-[#F6F9FC] p-3.5 rounded-xl border border-[#E5EAEF]">
            <span className="text-[11px] font-bold text-[#2A3547] uppercase tracking-wider block">
              ⚡ Quick Fill Demo Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoAccount('supply@terracem.com')}
                className="p-2 rounded-lg bg-white hover:bg-[#ECF2FF] text-[#2A3547] hover:text-[#5D87FF] border border-[#E5EAEF] flex items-center gap-2 transition-all text-left font-semibold cursor-pointer shadow-2xs"
              >
                <Factory className="w-3.5 h-3.5 text-[#5D87FF] shrink-0" />
                <span className="truncate">Emitter</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('procurement@greenforge.com')}
                className="p-2 rounded-lg bg-white hover:bg-[#ECF2FF] text-[#2A3547] hover:text-[#5D87FF] border border-[#E5EAEF] flex items-center gap-2 transition-all text-left font-semibold cursor-pointer shadow-2xs"
              >
                <Building2 className="w-3.5 h-3.5 text-[#5D87FF] shrink-0" />
                <span className="truncate">Utilizer</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('logistics@transcarbon.com')}
                className="p-2 rounded-lg bg-white hover:bg-[#ECF2FF] text-[#2A3547] hover:text-[#5D87FF] border border-[#E5EAEF] flex items-center gap-2 transition-all text-left font-semibold cursor-pointer shadow-2xs"
              >
                <Truck className="w-3.5 h-3.5 text-[#5D87FF] shrink-0" />
                <span className="truncate">Logistics</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('admin@carbonloop.io')}
                className="p-2 rounded-lg bg-white hover:bg-[#E8F9F5] text-[#2A3547] hover:text-[#13DEB9] border border-[#E5EAEF] flex items-center gap-2 transition-all text-left font-semibold cursor-pointer shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#13DEB9] shrink-0" />
                <span className="truncate">Admin</span>
              </button>
            </div>
          </div>

          {/* Error Feedback */}
          {error && (
            <div className="p-3.5 rounded-xl bg-[#FDEDE8] border border-[#FA896B]/30 text-[#FA896B] text-xs font-semibold flex items-center gap-2">
              <span>⚠️ {error}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Work Email */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Work Email</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6A85]" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="supply@terracem.com"
                  className="pl-10 h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-xl focus-visible:ring-[#5D87FF]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Password</Label>
                <Link to="/forgot-password" className="text-xs font-semibold text-[#5D87FF] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6A85]" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-xl focus-visible:ring-[#5D87FF]"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#5D87FF] hover:bg-[#4570EA] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              {loading ? 'Authenticating...' : 'Sign In to Console'} <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

        </div>

        {/* Footer Link */}
        <div className="border-t border-[#E5EAEF] pt-4 text-center text-xs font-medium text-[#5A6A85]">
          Don't have an industrial account?{' '}
          <Link to="/register" className="text-[#5D87FF] font-bold hover:underline ml-1">
            Register Entity
          </Link>
        </div>

      </div>

    </FadeUp>
  );
};

export default LoginPage;
