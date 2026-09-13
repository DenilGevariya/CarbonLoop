import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/api';
import { useCreateListing, useUpdateListing } from '../../hooks/useListings';
import type { ListingDTO } from '../../types/listing';
import { 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Send, 
  AlertCircle, 
  Sparkles,
  ShieldCheck,
  FileText,
  Upload,
  Eye,
  Trash2,
  RefreshCw,
  FileCheck 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { NativeSelect } from '@/components/ui/native-select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ReportViewerModal } from '../ReportViewerModal';

const listingFormSchema = z.object({
  facilityId: z.string().min(1, { message: 'Select an operational facility' }),
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }).max(255),
  description: z.string().max(2000).optional(),
  availableQuantity: z.number().gt(0, { message: 'Available quantity must be greater than 0' }),
  quantityUnit: z.string().optional(),
  minimumOrderQuantity: z.number().optional(),
  purityPercentage: z.number().gt(0, { message: 'Purity must be > 0%' }).lte(100, { message: 'Purity cannot exceed 100%' }),
  physicalForm: z.enum(['liquid', 'gaseous', 'supercritical', 'solid_dry_ice']),
  captureMethod: z.string().optional(),
  captureSource: z.string().optional(),
  temperatureCelsius: z.number().optional(),
  pressureBar: z.number().optional(),
  pricePerUnit: z.number().min(0, { message: 'Price cannot be negative' }),
  currency: z.string().optional(),
  availableFrom: z.string().min(1, { message: 'Select availability start date' }),
  availableUntil: z.string().optional(),
  deliveryAvailable: z.boolean().optional(),
  pickupAvailable: z.boolean().optional(),
  labReportUrl: z.string().optional(),
  labReportFilename: z.string().optional(),
}).refine((data) => {
  if (data.availableUntil && data.availableFrom) {
    return new Date(data.availableUntil) >= new Date(data.availableFrom);
  }
  return true;
}, {
  message: 'Available until date must be after available from date',
  path: ['availableUntil'],
});

export type ListingFormValues = z.infer<typeof listingFormSchema>;

interface Props {
  initialListing?: ListingDTO | null;
  mode?: 'create' | 'edit';
}

const STEPS = [
  { id: '01', title: 'SUPPLY', desc: 'Quantity & Facility' },
  { id: '02', title: 'SPECIFICATION', desc: 'Composition & Telematics' },
  { id: '03', title: 'COMMERCIAL', desc: 'Pricing & Terms' },
  { id: '04', title: 'AVAILABILITY', desc: 'Time Window' },
  { id: '05', title: 'DELIVERY', desc: 'Logistics Options' },
  { id: '06', title: 'VERIFICATION', desc: 'Certificates' },
  { id: '07', title: 'REVIEW', desc: 'Declaration Preview' },
];

export const ListingForm: React.FC<Props> = ({ initialListing, mode = 'create' }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [facilities, setFacilities] = useState<{ id: string; name: string; city: string; state: string }[]>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);

  const createMutation = useCreateListing();
  const updateMutation = useUpdateListing();

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      facilityId: initialListing?.facility.id || '',
      title: initialListing?.title || '',
      description: initialListing?.description || '',
      availableQuantity: initialListing?.quantity.available || 500,
      quantityUnit: initialListing?.quantity.unit || 'tonne',
      minimumOrderQuantity: initialListing?.quantity.minimumOrder || 1,
      purityPercentage: initialListing?.purityPercentage || 99.5,
      physicalForm: (initialListing?.physicalForm?.toLowerCase() as any) || 'liquid',
      captureMethod: initialListing?.captureMethod || 'Chemical Amine Gas Absorption',
      captureSource: initialListing?.captureSource || 'Flue Gas Calcination',
      temperatureCelsius: initialListing?.temperatureCelsius ?? -15,
      pressureBar: initialListing?.pressureBar ?? 25,
      pricePerUnit: initialListing?.price.amount || 4800,
      currency: initialListing?.price.currency || 'INR',
      availableFrom: initialListing?.availability.from ? new Date(initialListing.availability.from).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      availableUntil: initialListing?.availability.until ? new Date(initialListing.availability.until).toISOString().split('T')[0] : '',
      deliveryAvailable: initialListing?.deliveryAvailable !== false,
      pickupAvailable: initialListing?.pickupAvailable !== false,
      labReportUrl: initialListing?.labReportUrl || '',
      labReportFilename: initialListing?.labReportFilename || '',
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      form.setValue('labReportUrl', fileUrl, { shouldValidate: true });
      form.setValue('labReportFilename', file.name, { shouldValidate: true });
    }
  };

  const handleRemoveFile = () => {
    form.setValue('labReportUrl', '', { shouldValidate: true });
    form.setValue('labReportFilename', '', { shouldValidate: true });
  };

  // Fetch facilities for logged-in emitter
  useEffect(() => {
    async function loadFacilities() {
      setFacilitiesLoading(true);
      const res = await apiRequest('/organizations/my-facilities');
      if (res.success && res.data) {
        setFacilities(res.data);
        if (res.data.length > 0 && !form.getValues('facilityId')) {
          form.setValue('facilityId', res.data[0].id);
        }
      }
      setFacilitiesLoading(false);
    }
    loadFacilities();
  }, [form]);

  const handleSaveDraft = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const values = form.getValues();
    if (mode === 'create') {
      const res = await createMutation.mutateAsync({
        ...values,
        publishNow: false,
      });
      if (res.success) {
        navigate('/dashboard/listings');
      }
    } else if (initialListing) {
      const res = await updateMutation.mutateAsync({
        id: initialListing.id,
        input: values,
      });
      if (res.success) {
        navigate('/dashboard/listings');
      }
    }
  };

  const handlePublish = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const values = form.getValues();
    if (mode === 'create') {
      const res = await createMutation.mutateAsync({
        ...values,
        publishNow: true,
      });
      if (res.success) {
        navigate('/dashboard/listings', {
          state: { successMessage: 'CO₂ listing published successfully.' },
        });
      }
    } else if (initialListing) {
      const res = await updateMutation.mutateAsync({
        id: initialListing.id,
        input: values,
      });
      if (res.success) {
        navigate('/dashboard/listings');
      }
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const values = form.watch();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 font-sans">
      {/* Wizard Step Indicator Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5EAEF] shadow-xs">
        <div className="flex items-center justify-between overflow-x-auto pb-2 sm:pb-0 scrollbar-none gap-2">
          {STEPS.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(index)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#5D87FF] text-white font-bold shadow-xs'
                    : isCompleted
                    ? 'bg-[#ECF2FF] text-[#5D87FF] hover:bg-[#5D87FF]/20 font-semibold'
                    : 'text-[#5A6A85] hover:text-[#2A3547] hover:bg-[#F6F9FC]'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  isCurrent ? 'bg-white text-[#5D87FF]' : isCompleted ? 'bg-[#5D87FF] text-white' : 'bg-[#E5EAEF] text-[#5A6A85]'
                }`}>
                  {isCompleted ? <Check className="w-3 h-3" /> : step.id}
                </span>
                <span className="hidden sm:inline uppercase tracking-wider">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={(e) => e.preventDefault()} className="bg-white rounded-xl border border-[#E5EAEF] p-6 sm:p-8 shadow-xs space-y-6">
        {/* Step 01: SUPPLY */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="border-b border-[#E5EAEF] pb-4">
              <span className="text-xs text-[#5D87FF] font-semibold uppercase tracking-wider bg-[#ECF2FF] px-2.5 py-1 rounded-md">Step 01 • Facility & Quantity</span>
              <h2 className="text-xl text-[#2A3547] font-bold mt-2">Captured CO₂ available for utilization</h2>
              <p className="text-xs text-[#5A6A85] mt-1 font-medium">
                Select your operating facility and specify the available carbon volume.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-[#5A6A85] font-semibold block mb-1.5">
                  Select Facility Stack *
                </label>
                {facilitiesLoading ? (
                  <p className="text-xs text-[#5A6A85]">Loading facilities...</p>
                ) : facilities.length === 0 ? (
                  <Alert className="bg-[#FEF5E5] border-[#FFAE1F]/30">
                    <AlertCircle className="w-4 h-4 text-[#FFAE1F]" />
                    <AlertTitle className="text-xs font-bold text-[#2A3547]">No Facilities Registered</AlertTitle>
                    <AlertDescription className="text-xs text-[#5A6A85]">
                      You must register an industrial facility in your organization profile before declaring supply.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <NativeSelect
                    {...form.register('facilityId')}
                    className="w-full bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-lg"
                  >
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.city}, {f.state})
                      </option>
                    ))}
                  </NativeSelect>
                )}
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-[#5A6A85] font-semibold block mb-1.5">
                  Supply Stream Title *
                </label>
                <Input
                  {...form.register('title')}
                  placeholder="e.g. High-Purity Liquid CO2 (Amine Gas Scrubbing)"
                  className="bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] rounded-lg focus-visible:ring-[#5D87FF]"
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-[#FA896B] mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-[#5A6A85] font-semibold block mb-1.5">
                  Available Volume (Tonnes) *
                </label>
                <Input
                  type="number"
                  {...form.register('availableQuantity', { valueAsNumber: true })}
                  className="bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] rounded-lg focus-visible:ring-[#5D87FF]"
                />
                {form.formState.errors.availableQuantity && (
                  <p className="text-xs text-[#FA896B] mt-1">{form.formState.errors.availableQuantity.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 02: SPECIFICATION */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-[#E5EAEF] pb-4">
              <span className="text-xs text-[#5D87FF] font-semibold uppercase tracking-wider bg-[#ECF2FF] px-2.5 py-1 rounded-md">Step 02 • Composition & Characteristics</span>
              <h2 className="text-xl text-[#2A3547] font-bold mt-2">Gas purity, physical state, & temperature</h2>
              <p className="text-xs text-[#5A6A85] mt-1 font-medium">
                Accurate gas chromatography data ensures compatibility with industrial buyers.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-[#5A6A85] font-semibold block mb-1.5">
                    Purity Rating (%) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register('purityPercentage', { valueAsNumber: true })}
                    className="bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] rounded-lg focus-visible:ring-[#5D87FF]"
                  />
                  {form.formState.errors.purityPercentage && (
                    <p className="text-xs text-[#FA896B] mt-1">{form.formState.errors.purityPercentage.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-[#5A6A85] font-semibold block mb-1.5">
                    Physical Form State *
                  </label>
                  <NativeSelect
                    {...form.register('physicalForm')}
                    className="w-full bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-lg"
                  >
                    <option value="liquid">Liquid (Cryogenic Tanker)</option>
                    <option value="gaseous">Gaseous (Pipeline / Cylinder)</option>
                    <option value="supercritical">Supercritical Fluid</option>
                    <option value="solid_dry_ice">Solid / Dry Ice</option>
                  </NativeSelect>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-[#5A6A85] font-semibold block mb-1.5">
                    Capture Process Method
                  </label>
                  <Input
                    {...form.register('captureMethod')}
                    placeholder="e.g. Amine Gas Absorption"
                    className="bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] rounded-lg focus-visible:ring-[#5D87FF]"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-[#5A6A85] font-semibold block mb-1.5">
                    Industrial Flue Source
                  </label>
                  <Input
                    {...form.register('captureSource')}
                    placeholder="e.g. Cement Kiln Flue Gas"
                    className="bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] rounded-lg focus-visible:ring-[#5D87FF]"
                  />
                </div>
              </div>

              {/* Laboratory Purity Report Upload Section */}
              <div className="p-4 bg-[#F6F9FC] border border-[#E5EAEF] rounded-xl space-y-3 mt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-[#2A3547] font-bold flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#5D87FF]" /> Laboratory Purity Report *
                    </label>
                    <p className="text-xs text-[#5A6A85] mt-0.5 font-medium">
                      Upload the laboratory report verifying the stated CO₂ purity. (Accepted: PDF, JPG, JPEG, PNG)
                    </p>
                  </div>

                  <input
                    type="file"
                    id="lab-report-input"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {values.labReportUrl ? (
                  <div className="flex items-center justify-between p-3 bg-white border border-[#13DEB9]/30 rounded-lg">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileCheck className="w-5 h-5 text-[#13DEB9] shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-[#2A3547] truncate">{values.labReportFilename || 'Uploaded_Lab_Report.pdf'}</p>
                        <p className="text-[10px] text-[#13DEB9] font-semibold">✓ Report attached to this CO₂ supply declaration</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsReportPreviewOpen(true)}
                        className="text-xs border-[#E5EAEF] text-[#5D87FF] hover:bg-[#ECF2FF] h-8 rounded-md cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View Report
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('lab-report-input')?.click()}
                        className="text-xs border-[#E5EAEF] text-[#2A3547] hover:bg-[#F6F9FC] h-8 rounded-md cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> Replace
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="text-xs text-[#FA896B] hover:bg-[#FDEDE8] h-8 px-2 rounded-md cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('lab-report-input')?.click()}
                      className="w-full bg-white border-dashed border-2 border-[#5D87FF]/40 hover:border-[#5D87FF] text-[#5D87FF] py-6 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4" /> Upload Laboratory Purity Report (PDF, PNG, JPG)
                    </Button>
                  </div>
                )}

                {form.formState.errors.labReportUrl && (
                  <p className="text-xs text-[#FA896B] mt-1">{form.formState.errors.labReportUrl.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 03: COMMERCIAL */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-[#E5EAEF] pb-4">
              <span className="text-xs text-[#5D87FF] font-semibold uppercase tracking-wider bg-[#ECF2FF] px-2.5 py-1 rounded-md">Step 03 • Commercial Terms</span>
              <h2 className="text-xl text-[#2A3547] font-bold mt-2">Off-Take pricing & unit valuation</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-[#5A6A85] font-semibold block mb-1.5">
                  Unit Price (INR per Tonne) *
                </label>
                <Input
                  type="number"
                  {...form.register('pricePerUnit', { valueAsNumber: true })}
                  className="bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] rounded-lg focus-visible:ring-[#5D87FF]"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-[#5A6A85] font-semibold block mb-1.5">
                  Currency Code
                </label>
                <Input
                  disabled
                  value="INR (₹)"
                  className="bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#5A6A85] rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 04: AVAILABILITY */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-[#E5EAEF] pb-4">
              <span className="text-xs text-[#5D87FF] font-semibold uppercase tracking-wider bg-[#ECF2FF] px-2.5 py-1 rounded-md">Step 04 • Availability Timeline</span>
              <h2 className="text-xl text-[#2A3547] font-bold mt-2">Off-Take window duration</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-[#5A6A85] font-semibold block mb-1.5">
                  Available From Date *
                </label>
                <Input
                  type="date"
                  {...form.register('availableFrom')}
                  className="bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-[#5A6A85] font-semibold block mb-1.5">
                  Available Until Date
                </label>
                <Input
                  type="date"
                  {...form.register('availableUntil')}
                  className="bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 05: DELIVERY */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-[#E5EAEF] pb-4">
              <span className="text-xs text-[#5D87FF] font-semibold uppercase tracking-wider bg-[#ECF2FF] px-2.5 py-1 rounded-md">Step 05 • Delivery & Pickup Options</span>
              <h2 className="text-xl text-[#2A3547] font-bold mt-2">Logistics capability parameters</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#F6F9FC] border border-[#E5EAEF] rounded-xl">
                <div>
                  <h4 className="text-sm font-bold text-[#2A3547]">Cryogenic ISO Tanker Delivery Available</h4>
                  <p className="text-xs text-[#5A6A85] font-medium">Facility provides dispatch via logistics partner network.</p>
                </div>
                <Switch
                  checked={values.deliveryAvailable}
                  onCheckedChange={(val) => form.setValue('deliveryAvailable', val)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#F6F9FC] border border-[#E5EAEF] rounded-xl">
                <div>
                  <h4 className="text-sm font-bold text-[#2A3547]">Self-Organized Buyer Gate Pickup Allowed</h4>
                  <p className="text-xs text-[#5A6A85] font-medium">Buyers can dispatch certified cryogenic tankers directly to stack gate.</p>
                </div>
                <Switch
                  checked={values.pickupAvailable}
                  onCheckedChange={(val) => form.setValue('pickupAvailable', val)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 06: VERIFICATION */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-[#E5EAEF] pb-4">
              <span className="text-xs text-[#5D87FF] font-semibold uppercase tracking-wider bg-[#ECF2FF] px-2.5 py-1 rounded-md">Step 06 • Technical Certificates</span>
              <h2 className="text-xl text-[#2A3547] font-bold mt-2">Laboratory Purity Report & Gas Assays</h2>
            </div>

            <div className="p-5 bg-[#F6F9FC] border border-[#E5EAEF] rounded-xl flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-[#5D87FF] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#2A3547]">Automated Trust Network Verification</h4>
                <p className="text-xs text-[#5A6A85] mt-1 font-medium leading-relaxed">
                  Upon declaration, gas assays are cross-checked against registered ISO-certified laboratory evidence in your organization vault.
                </p>
              </div>
            </div>

            {/* Verification Step File Attachment Preview */}
            <div className="bg-white p-4 border border-[#E5EAEF] rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Attached Laboratory Report</h4>
              {values.labReportUrl ? (
                <div className="flex items-center justify-between p-3 bg-[#F6F9FC] border border-[#13DEB9]/30 rounded-lg">
                  <div className="flex items-center gap-2.5 truncate">
                    <FileCheck className="w-5 h-5 text-[#13DEB9] shrink-0" />
                    <span className="text-xs font-bold text-[#2A3547] truncate">{values.labReportFilename || 'Uploaded_Lab_Report.pdf'}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsReportPreviewOpen(true)}
                    className="text-xs text-[#5D87FF] border-[#5D87FF]/30 hover:bg-[#ECF2FF]"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" /> View Report
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-[#FA896B]">⚠️ No laboratory report attached. Please upload a report in Step 02.</p>
              )}
            </div>
          </div>
        )}

        {/* Step 07: REVIEW & PREVIEW */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="border-b border-[#E5EAEF] pb-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#5D87FF] font-semibold uppercase tracking-wider bg-[#ECF2FF] px-2.5 py-1 rounded-md">Step 07 • Review Declaration</span>
                <h2 className="text-xl text-[#2A3547] font-bold mt-2">Final CO₂ Supply Declaration Preview</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8F9F5] border border-[#13DEB9]/20 text-[#13DEB9] text-xs font-semibold rounded-full">
                <Sparkles className="w-3.5 h-3.5" /> Declaration Ready
              </span>
            </div>

            {/* Industrial Specification Sheet Declaration Card */}
            <div className="bg-[#F6F9FC] border border-[#E5EAEF] p-6 rounded-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAEF] pb-4">
                <div>
                  <h3 className="text-2xl text-[#2A3547] font-bold">{values.title}</h3>
                  <p className="text-xs text-[#5A6A85] font-medium mt-1">
                    State: <span className="font-bold text-[#2A3547] uppercase">{values.physicalForm}</span> • Purity: <span className="font-bold text-[#5D87FF]">{values.purityPercentage}%</span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-[#5A6A85] uppercase font-medium">Unit Commercial Rate</p>
                  <p className="text-xl font-bold text-[#2A3547]">₹{values.pricePerUnit} <span className="text-xs font-normal text-[#5A6A85]">/ {values.quantityUnit}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[#5A6A85] uppercase text-[10px] font-semibold">Volume</span>
                  <span className="font-bold text-[#2A3547] block">{values.availableQuantity} {values.quantityUnit}s</span>
                </div>
                <div>
                  <span className="text-[#5A6A85] uppercase text-[10px] font-semibold">Delivery</span>
                  <span className="font-bold text-[#13DEB9] block">{values.deliveryAvailable ? 'Yes (ISO Tanker)' : 'No'}</span>
                </div>
                <div>
                  <span className="text-[#5A6A85] uppercase text-[10px] font-semibold">Pickup</span>
                  <span className="font-bold text-[#13DEB9] block">{values.pickupAvailable ? 'Yes (Gate)' : 'No'}</span>
                </div>
              </div>

              {/* PURITY VERIFICATION PREVIEW BLOCK */}
              <div className="border-t border-[#E5EAEF] pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#2A3547] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#5D87FF]" /> PURITY VERIFICATION
                  </h4>
                  <span className="px-2.5 py-0.5 bg-[#FEF5E5] text-[#FFAE1F] border border-[#FFAE1F]/30 text-[11px] font-bold rounded-full">
                    Pending Verification
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-lg border border-[#E5EAEF]">
                  <div>
                    <span className="text-[#5A6A85] text-[10px] uppercase font-semibold block">Stated CO₂ Purity</span>
                    <span className="font-bold text-[#5D87FF] text-sm">{values.purityPercentage}%</span>
                  </div>

                  <div>
                    <span className="text-[#5A6A85] text-[10px] uppercase font-semibold block">Laboratory Purity Report</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-[#2A3547] truncate max-w-[160px]">
                        {values.labReportFilename || 'Uploaded_Lab_Report.pdf'}
                      </span>
                      {values.labReportUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsReportPreviewOpen(true)}
                          className="h-6 text-[10px] px-2 text-[#5D87FF] border-[#5D87FF]/30 hover:bg-[#ECF2FF]"
                        >
                          <Eye className="w-3 h-3 mr-1" /> View Report
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-[#5A6A85] font-medium">
                  ℹ️ Purity report submitted — awaiting regulator verification before official verified seal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation Controls */}
        <div className="border-t border-[#E5EAEF] pt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0 || isSubmitting}
            className="border-[#E5EAEF] text-xs gap-1.5 text-[#2A3547] hover:border-[#5D87FF] rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="border-[#E5EAEF] text-xs gap-1.5 text-[#2A3547] hover:border-[#5D87FF] rounded-lg font-semibold"
            >
              <Save className="w-3.5 h-3.5" /> Save Draft
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={async () => {
                  const isValid = await form.trigger();
                  if (isValid) setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1));
                }}
                className="bg-[#5D87FF] hover:bg-[#4570EA] text-white text-xs gap-1.5 px-5 font-semibold rounded-lg cursor-pointer"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handlePublish}
                disabled={isSubmitting}
                className="bg-[#5D87FF] hover:bg-[#4570EA] text-white text-xs gap-1.5 px-6 font-semibold rounded-lg cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> {isSubmitting ? 'Publishing...' : 'Publish Listing'}
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Report PDF / Document Viewer Modal */}
      <ReportViewerModal
        isOpen={isReportPreviewOpen}
        onClose={() => setIsReportPreviewOpen(false)}
        reportUrl={values.labReportUrl}
        filename={values.labReportFilename}
        purityPercentage={values.purityPercentage}
      />
    </div>
  );
};
