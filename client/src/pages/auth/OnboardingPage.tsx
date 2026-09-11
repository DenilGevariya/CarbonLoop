import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const OnboardingPage: React.FC = () => {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    userRoleTitle: 'Organization Administrator',
    orgName: '',
    legalName: '',
    orgType: 'EMITTER',
    industry: 'Cement & Building Materials',
    website: '',
    registrationNumber: '',
    taxIdentifier: '',
    state: 'Gujarat',
    city: 'Ahmedabad',
    postalCode: '380001',
    addressLine1: 'GIDC Industrial Infrastructure Park',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 2 && !formData.orgName) {
      setError('Please provide your organization name.');
      return;
    }
    setError(null);
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await completeOnboarding(formData);
      if (res.success) {
        setStep(4);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(res.error || 'Onboarding failed.');
      }
    } catch {
      setError('An error occurred during onboarding setup.');
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ['01 PERSONAL', '02 ORGANIZATION', '03 LOCATION', '04 VERIFICATION'];

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#171A18] flex flex-col items-center justify-center p-4 md:p-8 relative">
      <div className="max-w-2xl w-full flex flex-col gap-6">
        
        {/* Header Branding */}
        <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-8 bg-[#173D32] border border-[#3C6E5C] text-white flex items-center justify-center font-mono font-bold text-xs">
              C⟳
            </div>
            <span className="text-xl font-black tracking-tight uppercase font-mono text-[#171A18]">
              CARBON<span className="text-[#3C6E5C] font-light">LOOP</span>
            </span>
          </div>

          <span className="text-xs font-mono text-[#5C6560] uppercase">
            ENTITY ONBOARDING PROTOCOL
          </span>
        </div>

        {/* Multi-step Progress Indicator */}
        <div className="grid grid-cols-4 gap-2 font-mono text-[10px]">
          {stepLabels.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;
            return (
              <div
                key={label}
                className={`py-2 px-3 border transition-colors flex items-center justify-between ${
                  isCompleted
                    ? 'bg-[#173D32] text-white border-[#173D32]'
                    : isActive
                    ? 'bg-[#EBE7DF] text-[#173D32] border-[#173D32] font-bold'
                    : 'bg-[#FAF8F5] text-[#5C6560] border-[#E2DDD5]'
                }`}
              >
                <span>{label}</span>
                {isCompleted && <CheckCircle2 className="size-3 text-[#A3B899]" />}
              </div>
            );
          })}
        </div>

        {/* Main Step Card Container */}
        <div className="bg-[#FAF8F5] border border-[#E2DDD5] p-8 space-y-6 relative overflow-hidden shadow-sm">
          {error && (
            <div className="p-3 bg-[#8C6D38]/10 border border-[#8C6D38] text-[#8C6D38] text-xs font-mono">
              ⚠️ {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            
            {/* STEP 1: PERSONAL PROFILE */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-1 border-b border-[#E2DDD5] pb-4">
                  <h3 className="text-xl font-bold text-[#171A18] tracking-tight">
                    Step 1: Primary Representative Profile
                  </h3>
                  <p className="text-xs text-[#5C6560] font-serif">
                    Confirm your contact information as the primary organizational administrator.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-mono text-[#171A18] uppercase">First Name</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className="bg-[#EBE7DF] border-[#DCD6C9] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-mono text-[#171A18] uppercase">Last Name</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className="bg-[#EBE7DF] border-[#DCD6C9] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-mono text-[#171A18] uppercase">Work Phone</Label>
                    <Input
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="bg-[#EBE7DF] border-[#DCD6C9] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-mono text-[#171A18] uppercase">Job Title</Label>
                    <Input
                      value={formData.userRoleTitle}
                      onChange={(e) => handleChange('userRoleTitle', e.target.value)}
                      className="bg-[#EBE7DF] border-[#DCD6C9] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E2DDD5] flex justify-end">
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-[#173D32] hover:bg-[#255244] text-white font-mono text-xs font-bold uppercase py-3 px-6 rounded-none flex items-center gap-2 border border-[#173D32]"
                  >
                    Proceed to Organization Setup <ArrowRight className="size-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: ORGANIZATION PROFILE */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-1 border-b border-[#E2DDD5] pb-4">
                  <h3 className="text-xl font-bold text-[#171A18] tracking-tight">
                    Step 2: Organization Entity Parameters
                  </h3>
                  <p className="text-xs text-[#5C6560] font-serif">
                    Define your corporate identity and operational domain within CarbonLoop.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-mono text-[#171A18] uppercase">Organization Name *</Label>
                    <Input
                      placeholder="e.g. Gujarat Cement Works Ltd."
                      value={formData.orgName}
                      onChange={(e) => handleChange('orgName', e.target.value)}
                      className="bg-[#EBE7DF] border-[#DCD6C9] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-mono text-[#171A18] uppercase">Entity Sector Role *</Label>
                      <Select
                        value={formData.orgType}
                        onValueChange={(val) => { if (val) handleChange('orgType', val); }}
                      >
                        <SelectTrigger className="bg-[#EBE7DF] border-[#DCD6C9] text-xs font-mono rounded-none">
                          <SelectValue placeholder="Select Organization Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#FAF8F5] border-[#E2DDD5] font-mono text-xs">
                          <SelectItem value="EMITTER">CO₂ Stack Emitter (Cement, Steel, Power)</SelectItem>
                          <SelectItem value="BUYER">CO₂ Off-Take Buyer (Concrete, E-Fuels)</SelectItem>
                          <SelectItem value="LOGISTICS_PROVIDER">Logistics Freight Partner</SelectItem>
                          <SelectItem value="REGULATOR">Regulator & Inspector</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-mono text-[#171A18] uppercase">Industry Sector</Label>
                      <Input
                        placeholder="e.g. Heavy Cement Calcination"
                        value={formData.industry}
                        onChange={(e) => handleChange('industry', e.target.value)}
                        className="bg-[#EBE7DF] border-[#DCD6C9] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-mono text-[#171A18] uppercase">Corporate Website</Label>
                      <Input
                        placeholder="https://company.com"
                        value={formData.website}
                        onChange={(e) => handleChange('website', e.target.value)}
                        className="bg-[#EBE7DF] border-[#DCD6C9] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-mono text-[#171A18] uppercase">Registration / CIN</Label>
                      <Input
                        placeholder="CIN-L26940GJ2015"
                        value={formData.registrationNumber}
                        onChange={(e) => handleChange('registrationNumber', e.target.value)}
                        className="bg-[#EBE7DF] border-[#DCD6C9] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E2DDD5] flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="bg-[#EBE7DF] text-[#171A18] border-[#DCD6C9] font-mono text-xs uppercase"
                  >
                    <ArrowLeft className="size-4 mr-2" /> Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-[#173D32] hover:bg-[#255244] text-white font-mono text-xs font-bold uppercase py-3 px-6 rounded-none flex items-center gap-2 border border-[#173D32]"
                  >
                    Proceed to Location Details <ArrowRight className="size-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: LOCATION & ADDRESS */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-1 border-b border-[#E2DDD5] pb-4">
                  <h3 className="text-xl font-bold text-[#171A18] tracking-tight">
                    Step 3: Primary Facility / HQ Location
                  </h3>
                  <p className="text-xs text-[#5C6560] font-serif">
                    Geographic coordinates are required to calculate freight radii and off-take transport compatibility.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-mono text-[#171A18] uppercase">Street Address Line 1 *</Label>
                    <Input
                      placeholder="GIDC Phase IV, Vatva Industrial Zone"
                      value={formData.addressLine1}
                      onChange={(e) => handleChange('addressLine1', e.target.value)}
                      className="bg-[#EBE7DF] border-[#DCD6C9] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-mono text-[#171A18] uppercase">City *</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className="bg-[#EBE7DF] border-[#DCD6C9] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-mono text-[#171A18] uppercase">State *</Label>
                      <Input
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        className="bg-[#EBE7DF] border-[#DCD6C9] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-mono text-[#171A18] uppercase">Postal Code *</Label>
                      <Input
                        value={formData.postalCode}
                        onChange={(e) => handleChange('postalCode', e.target.value)}
                        className="bg-[#EBE7DF] border-[#DCD6C9] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E2DDD5] flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="bg-[#EBE7DF] text-[#171A18] border-[#DCD6C9] font-mono text-xs uppercase"
                  >
                    <ArrowLeft className="size-4 mr-2" /> Back
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-[#173D32] hover:bg-[#255244] text-white font-mono text-xs font-bold uppercase py-3 px-6 rounded-none flex items-center gap-2 border border-[#173D32]"
                  >
                    {loading ? 'Initializing Membership...' : 'Complete Onboarding Setup'} <CheckCircle2 className="size-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS REVEAL */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-6 text-center py-6"
              >
                <div className="size-16 bg-[#173D32] border border-[#3C6E5C] text-white flex items-center justify-center font-mono font-bold text-2xl mx-auto">
                  ✓
                </div>

                <div className="space-y-2">
                  <span className="bg-[#EBE7DF] text-[#173D32] border border-[#DCD6C9] font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1 inline-block">
                    MEMBER ENTITY INITIALIZED
                  </span>
                  <h2 className="text-3xl font-black text-[#171A18] tracking-tight">
                    Your CarbonLoop network starts here.
                  </h2>
                  <p className="text-sm font-serif text-[#5C6560] max-w-md mx-auto leading-relaxed">
                    {formData.orgName} is now connected to the regional commercial CO₂ exchange. Redirecting to your operational console...
                  </p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
