import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { INDUSTRIAL_IMAGES } from '@/lib/images';
import { ArrowRight, Lock, Mail, User, Phone } from 'lucide-react';
import { FadeUp } from '@/animations';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await register(formData);
    if (res.success) {
      setSuccessMsg(res.message || 'Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(res.error || 'Registration failed.');
    }
    setLoading(false);
  };

  return (
    <FadeUp className="w-full bg-[#FAF8F5] border border-[#E2DDD5] grid grid-cols-1 md:grid-cols-12 overflow-hidden shadow-sm">
      
      {/* Left Column: Form */}
      <div className="md:col-span-6 p-6 sm:p-10 flex flex-col justify-between gap-6 bg-[#FAF8F5]">
        
        <div className="space-y-6">
          
          {/* Header */}
          <div className="space-y-2 border-b border-[#E2DDD5] pb-4">
            <span className="bg-[#EBE7DF] text-[#173D32] border border-[#DCD6C9] font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 inline-block">
              PRIMARY USER REGISTRATION
            </span>
            <h2 className="text-3xl font-black text-[#171A18] tracking-tight mt-2">
              Create Account
            </h2>
            <p className="text-xs text-[#5C6560] font-serif">
              Register representative details before setting up organization parameters.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-[#8C6D38]/10 border border-[#8C6D38] text-[#8C6D38] text-xs font-mono font-semibold">
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#173D32]/10 border border-[#173D32] text-[#173D32] text-xs font-mono font-bold">
              ✓ {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-[#171A18] uppercase font-bold">First Name</Label>
                <div className="relative">
                  <User className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6560]" />
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="Rajesh"
                    className="pl-9 h-10 bg-[#EBE7DF] border-[#DCD6C9] text-[#171A18] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-[#171A18] uppercase font-bold">Last Name</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Patel"
                  className="px-3 h-10 bg-[#EBE7DF] border-[#DCD6C9] text-[#171A18] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                  required
                />
              </div>
            </div>

            {/* Work Email */}
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-[#171A18] uppercase font-bold">Work Email</Label>
              <div className="relative">
                <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6560]" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="supply@organization.com"
                  className="pl-9 h-10 bg-[#EBE7DF] border-[#DCD6C9] text-[#171A18] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                  required
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-[#171A18] uppercase font-bold">Password</Label>
                <div className="relative">
                  <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6560]" />
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 h-10 bg-[#EBE7DF] border-[#DCD6C9] text-[#171A18] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-[#171A18] uppercase font-bold">Confirm Password</Label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className="px-3 h-10 bg-[#EBE7DF] border-[#DCD6C9] text-[#171A18] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-[#171A18] uppercase font-bold">Phone Number</Label>
              <div className="relative">
                <Phone className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6560]" />
                <Input
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+91 98234 56789"
                  className="pl-9 h-10 bg-[#EBE7DF] border-[#DCD6C9] text-[#171A18] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#173D32] hover:bg-[#255244] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-2 border border-[#173D32]"
            >
              {loading ? 'Creating Account...' : 'Register User Profile'} <ArrowRight className="size-4" />
            </Button>
          </form>

        </div>

        {/* Footer Link */}
        <div className="border-t border-[#E2DDD5] pt-4 text-center text-xs font-serif text-[#5C6560]">
          Already registered?{' '}
          <Link to="/login" className="text-[#173D32] font-mono font-bold hover:underline ml-1 uppercase">
            Sign In Here
          </Link>
        </div>

      </div>

      {/* Right Column: Editorial Photograph & Copy */}
      <div className="md:col-span-6 relative min-h-[350px] md:min-h-[550px] hidden md:flex flex-col justify-end p-8 border-l border-[#E2DDD5] overflow-hidden">
        <img
          src={INDUSTRIAL_IMAGES.chemicalRefinery}
          alt="Synthetic Fuel Refinery Infrastructure"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171A18]/95 via-[#171A18]/50 to-transparent" />

        <div className="relative z-10 space-y-3 text-white">
          <span className="text-[10px] font-mono text-[#A3B899] uppercase tracking-widest block font-bold bg-white/10 px-2.5 py-1 w-fit border border-white/15">
            COMMERCIAL CARBON NETWORK
          </span>
          <h2 className="text-3xl font-black tracking-tight leading-tight">
            Build your carbon network.
          </h2>
          <p className="text-sm font-serif text-[#C5D3C1] leading-relaxed">
            Connect your organization to a growing network of captured carbon supply, verified off-take demand, and cryogenic logistics carriers.
          </p>
        </div>
      </div>

    </FadeUp>
  );
};
