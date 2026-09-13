import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { INDUSTRIAL_IMAGES } from '@/lib/images';
import { ArrowRight, Lock, Mail, User, Phone, CheckCircle2, Factory, ShieldCheck, Truck, Key, FileCheck, Send } from 'lucide-react';
import { FadeUp } from '@/animations';

type RoleType = 'EMITTER' | 'BUYER' | 'REGULATOR' | 'LOGISTICS_PROVIDER' | 'PLATFORM_ADMIN';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<RoleType>('EMITTER');
  
  // Form fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
    gstNumber: '',
    registrationNumber: '',
    gstCertificateFile: '',
    otpCode: '',
  });

  // OTP state
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendOtp = () => {
    if (!formData.email) {
      setError('Please enter a company email address first.');
      return;
    }
    setError(null);
    setShowOtpModal(true);
  };

  const handleVerifyOtp = () => {
    if (!otpInput || otpInput.trim().length === 0) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setIsOtpVerified(true);
    setShowOtpModal(false);
    setFormData((prev) => ({ ...prev, otpCode: otpInput }));
    setError(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check OTP requirement for Emitter and Startup
    if ((selectedRole === 'EMITTER' || selectedRole === 'BUYER') && !isOtpVerified) {
      setError('Please verify your company email with the OTP verification code first.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      firstName: formData.firstName || (selectedRole === 'REGULATOR' ? 'Gov' : 'Officer'),
      lastName: formData.lastName || (selectedRole === 'REGULATOR' ? 'Inspector' : 'User'),
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      roleType: selectedRole,
      companyName: formData.companyName,
      gstNumber: formData.gstNumber,
      gstCertificateUrl: formData.gstCertificateFile || '/documents/gst_cert_sample.pdf',
      registrationNumber: formData.registrationNumber,
      otpCode: formData.otpCode,
    };

    const res = await register(payload);
    if (res.success) {
      setSuccessMsg(res.message || 'Account successfully created! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      setError(res.error || 'Registration failed.');
    }
    setLoading(false);
  };

  return (
    <FadeUp className="w-full bg-white border border-[#E5EAEF] rounded-2xl grid grid-cols-1 md:grid-cols-12 overflow-hidden shadow-lg font-sans">
      
      {/* Left Column: Multi-Role Registration Form */}
      <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between gap-6 bg-white">
        
        <div className="space-y-6">
          
          {/* Header */}
          <div className="space-y-2 border-b border-[#E5EAEF] pb-4">
            <span className="px-3 py-1 rounded-md bg-[#ECF2FF] border border-[#5D87FF]/20 text-[#5D87FF] text-[10px] font-bold uppercase tracking-wider inline-block">
              PORTAL ACCOUNT REGISTRATION
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2A3547] tracking-tight mt-1">
              Select User Account Type
            </h2>
            <p className="text-xs text-[#5A6A85] font-medium">
              Choose your role in the circular carbon ecosystem to set up explicit credentials.
            </p>
          </div>

          {/* 1. ROLE SELECTION CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => { setSelectedRole('EMITTER'); setError(null); }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                selectedRole === 'EMITTER'
                  ? 'border-[#5D87FF] bg-[#ECF2FF] text-[#5D87FF] shadow-xs'
                  : 'border-[#E5EAEF] bg-[#F6F9FC] text-[#5A6A85] hover:border-[#5D87FF]/50'
              }`}
            >
              <Factory className="w-5 h-5" />
              <div>
                <p className="text-xs font-bold leading-tight">Industrial Emitter</p>
                <p className="text-[10px] opacity-80">CO₂ Capture Plant</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('BUYER'); setError(null); }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                selectedRole === 'BUYER'
                  ? 'border-[#5D87FF] bg-[#ECF2FF] text-[#5D87FF] shadow-xs'
                  : 'border-[#E5EAEF] bg-[#F6F9FC] text-[#5A6A85] hover:border-[#5D87FF]/50'
              }`}
            >
              <FileCheck className="w-5 h-5" />
              <div>
                <p className="text-xs font-bold leading-tight">Utilization Startup</p>
                <p className="text-[10px] opacity-80">CO₂ Off-Taker</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('REGULATOR'); setError(null); }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                selectedRole === 'REGULATOR'
                  ? 'border-[#13DEB9] bg-[#E8F9F5] text-[#13DEB9] shadow-xs'
                  : 'border-[#E5EAEF] bg-[#F6F9FC] text-[#5A6A85] hover:border-[#13DEB9]/50'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <div>
                <p className="text-xs font-bold leading-tight">Policy Regulator</p>
                <p className="text-[10px] opacity-80">Government Audit</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('LOGISTICS_PROVIDER'); setError(null); }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                selectedRole === 'LOGISTICS_PROVIDER'
                  ? 'border-[#5D87FF] bg-[#ECF2FF] text-[#5D87FF] shadow-xs'
                  : 'border-[#E5EAEF] bg-[#F6F9FC] text-[#5A6A85] hover:border-[#5D87FF]/50'
              }`}
            >
              <Truck className="w-5 h-5" />
              <div>
                <p className="text-xs font-bold leading-tight">Logistics Provider</p>
                <p className="text-[10px] opacity-80">Freight Transporter</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('PLATFORM_ADMIN'); setError(null); }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                selectedRole === 'PLATFORM_ADMIN'
                  ? 'border-[#2A3547] bg-[#F6F9FC] text-[#2A3547] shadow-xs font-bold'
                  : 'border-[#E5EAEF] bg-[#F6F9FC] text-[#5A6A85] hover:border-[#2A3547]/50'
              }`}
            >
              <Key className="w-5 h-5" />
              <div>
                <p className="text-xs font-bold leading-tight">Platform Admin</p>
                <p className="text-[10px] opacity-80">System Operator</p>
              </div>
            </button>
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

          {/* 2. DYNAMIC ROLE FORM */}
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* ROLE 1 & 2: Industrial Emitters & Utilization Startups */}
            {(selectedRole === 'EMITTER' || selectedRole === 'BUYER') && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Company Email</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6A85]" />
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="corporate@company.com"
                        className="pl-10 h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-xl focus-visible:ring-[#5D87FF]"
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleSendOtp}
                      className={`h-11 px-4 text-xs font-bold rounded-xl cursor-pointer shrink-0 ${
                        isOtpVerified
                          ? 'bg-[#E8F9F5] text-[#13DEB9] border border-[#13DEB9]/30'
                          : 'bg-[#ECF2FF] text-[#5D87FF] border border-[#5D87FF]/30 hover:bg-[#5D87FF] hover:text-white'
                      }`}
                    >
                      {isOtpVerified ? 'Verified ✓' : 'Send OTP'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">GST Number</Label>
                    <Input
                      value={formData.gstNumber}
                      onChange={(e) => handleChange('gstNumber', e.target.value)}
                      placeholder="24AAAAA0000A1Z5"
                      className="px-3.5 h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-mono text-[#2A3547] rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">GST Certificate</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        onChange={(e) => handleChange('gstCertificateFile', e.target.files?.[0]?.name || 'gst_cert.pdf')}
                        className="h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#5A6A85] rounded-xl cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#ECF2FF] file:text-[#5D87FF]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Phone Number</Label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6A85]" />
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="pl-10 h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Password</Label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6A85]" />
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        placeholder="••••••••"
                        className="pl-10 h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-xl"
                        required
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ROLE 3: Policy Regulators */}
            {selectedRole === 'REGULATOR' && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Government Email ID</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6A85]" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="inspector@gov.in"
                      className="pl-10 h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Password</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6A85]" />
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-xl"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* ROLE 4: Logistics Providers */}
            {selectedRole === 'LOGISTICS_PROVIDER' && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Company Name</Label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    placeholder="CryoTrans Haulage Logistics Pvt Ltd"
                    className="px-3.5 h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-xl"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Company Email ID</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="dispatch@cryotrans.com"
                      className="px-3.5 h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Phone Number</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+91 98980 12345"
                      className="px-3.5 h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Company Reg / GST Number</Label>
                    <Input
                      value={formData.registrationNumber}
                      onChange={(e) => handleChange('registrationNumber', e.target.value)}
                      placeholder="U60231GJ2020PTC115432"
                      className="px-3.5 h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-mono text-[#2A3547] rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Password</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="••••••••"
                      className="px-3.5 h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-xl"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* ROLE 5: Admin */}
            {selectedRole === 'PLATFORM_ADMIN' && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Admin ID / Email</Label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6A85]" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="admin@carbonloop.com"
                      className="pl-10 h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Password</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6A85]" />
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 h-11 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-xl"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#5D87FF] hover:bg-[#4570EA] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs mt-4"
            >
              {loading ? 'Creating Credentials...' : `Register as ${selectedRole.replace('_', ' ')}`}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

        </div>

        {/* Footer Link */}
        <div className="border-t border-[#E5EAEF] pt-4 text-center text-xs font-medium text-[#5A6A85]">
          Already have account credentials?{' '}
          <Link to="/login" className="text-[#5D87FF] font-bold hover:underline ml-1">
            Sign In Here
          </Link>
        </div>

      </div>

      {/* Right Column: Industrial Photograph & Copy */}
      <div className="md:col-span-5 relative min-h-[350px] md:min-h-[550px] hidden md:flex flex-col justify-end p-8 border-l border-[#E5EAEF] overflow-hidden">
        <img
          src={INDUSTRIAL_IMAGES.chemicalRefinery}
          alt="Synthetic Fuel Refinery Infrastructure"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A3547]/95 via-[#2A3547]/50 to-transparent" />

        <div className="relative z-10 space-y-3 text-white">
          <span className="text-[10px] font-bold text-[#13DEB9] uppercase tracking-wider block bg-white/10 px-3 py-1 rounded-md w-fit backdrop-blur-sm border border-white/15">
            ROLE-BASED CO₂ EXCHANGE
          </span>
          <h2 className="text-3xl font-bold tracking-tight leading-tight text-white">
            Standardized Carbon Infrastructure.
          </h2>
          <p className="text-sm text-[#949C96] font-medium leading-relaxed">
            Register your explicit role to join verified point-source emitters, commercial utilizers, policy regulators, and cryogenic transport fleets.
          </p>
        </div>
      </div>

      {/* OTP DEMO MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5EAEF] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in zoom-in">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-[#ECF2FF] text-[#5D87FF] flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2A3547]">Verification Code</h3>
                <p className="text-xs text-[#5A6A85]">Sent to {formData.email}</p>
              </div>
            </div>
            
            <p className="text-xs text-[#5A6A85] bg-[#F6F9FC] p-3 rounded-xl border border-[#E5EAEF]">
              💡 <strong>Demo Verification:</strong> Enter any 6-digit code (e.g. <code>123456</code>) to verify your company email.
            </p>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#2A3547]">6-Digit OTP Code</Label>
              <Input
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="123456"
                className="h-11 bg-[#F6F9FC] border-[#E5EAEF] text-center font-mono font-bold text-lg tracking-widest rounded-xl"
                maxLength={6}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOtpModal(false)}
                className="flex-1 h-10 text-xs font-semibold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleVerifyOtp}
                className="flex-1 h-10 bg-[#5D87FF] hover:bg-[#4570EA] text-white text-xs font-semibold rounded-xl"
              >
                Verify Code
              </Button>
            </div>
          </div>
        </div>
      )}

    </FadeUp>
  );
};

export default RegisterPage;
