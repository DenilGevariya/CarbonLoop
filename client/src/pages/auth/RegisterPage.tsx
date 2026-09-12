import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { INDUSTRIAL_IMAGES } from '@/lib/images';
import { ArrowRight, Lock, Mail, User, Phone, CheckCircle2 } from 'lucide-react';
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
    <FadeUp className="w-full bg-white border border-[#E5EAEF] rounded-2xl grid grid-cols-1 md:grid-cols-12 overflow-hidden shadow-lg">
      
      {/* Left Column: Registration Form */}
      <div className="md:col-span-6 p-6 sm:p-10 flex flex-col justify-between gap-6 bg-white">
        
        <div className="space-y-6">
          
          {/* Header */}
          <div className="space-y-2 border-b border-[#E5EAEF] pb-4">
            <span className="px-3 py-1 rounded-md bg-[#ECF2FF] border border-[#5D87FF]/20 text-[#5D87FF] text-[10px] font-bold uppercase tracking-wider inline-block">
              ORGANIZATION REPRESENTATIVE ONBOARDING
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2A3547] tracking-tight mt-1">
              Create Account
            </h2>
            <p className="text-xs text-[#5A6A85] font-medium">
              Register representative details before setting up organization parameters.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-[#FDEDE8] border border-[#FA896B]/30 text-[#FA896B] text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-[#E8F9F5] border border-[#13DEB9]/30 text-[#13DEB9] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#13DEB9]" /> {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">First Name</Label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6A85]" />
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="Rajesh"
                    className="pl-10 h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-xl focus-visible:ring-[#5D87FF]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Last Name</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Patel"
                  className="px-3.5 h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-xl focus-visible:ring-[#5D87FF]"
                  required
                />
              </div>
            </div>

            {/* Work Email */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Work Email</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6A85]" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="supply@organization.com"
                  className="pl-10 h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-xl focus-visible:ring-[#5D87FF]"
                  required
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6A85]" />
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-xl focus-visible:ring-[#5D87FF]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Confirm Password</Label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className="px-3.5 h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-xl focus-visible:ring-[#5D87FF]"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Phone Number</Label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6A85]" />
                <Input
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+91 98234 56789"
                  className="pl-10 h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-xl focus-visible:ring-[#5D87FF]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#5D87FF] hover:bg-[#4570EA] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              {loading ? 'Creating Account...' : 'Register User Profile'} <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

        </div>

        {/* Footer Link */}
        <div className="border-t border-[#E5EAEF] pt-4 text-center text-xs font-medium text-[#5A6A85]">
          Already registered?{' '}
          <Link to="/login" className="text-[#5D87FF] font-bold hover:underline ml-1">
            Sign In Here
          </Link>
        </div>

      </div>

      {/* Right Column: Industrial Photograph & Copy */}
      <div className="md:col-span-6 relative min-h-[350px] md:min-h-[550px] hidden md:flex flex-col justify-end p-8 border-l border-[#E5EAEF] overflow-hidden">
        <img
          src={INDUSTRIAL_IMAGES.chemicalRefinery}
          alt="Synthetic Fuel Refinery Infrastructure"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A3547]/95 via-[#2A3547]/50 to-transparent" />

        <div className="relative z-10 space-y-3 text-white">
          <span className="text-[10px] font-bold text-[#13DEB9] uppercase tracking-wider block bg-white/10 px-3 py-1 rounded-md w-fit backdrop-blur-sm border border-white/15">
            COMMERCIAL CARBON NETWORK
          </span>
          <h2 className="text-3xl font-bold tracking-tight leading-tight text-white">
            Build your industrial carbon network.
          </h2>
          <p className="text-sm text-[#949C96] font-medium leading-relaxed">
            Connect your organization to a growing network of captured carbon supply, verified off-take demand, and cryogenic logistics carriers.
          </p>
        </div>
      </div>

    </FadeUp>
  );
};

export default RegisterPage;
