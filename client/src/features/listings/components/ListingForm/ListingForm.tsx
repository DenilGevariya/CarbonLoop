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
  ShieldCheck 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { NativeSelect } from '@/components/ui/native-select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const listingFormSchema = z.object({
  facilityId: z.string().min(1, { message: 'Select an operational facility' }),
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }).max(255),
  description: z.string().max(2000).optional(),
  availableQuantity: z.number().gt(0, { message: 'Available quantity must be greater than 0' }),
  quantityUnit: z.string().optional(),
  minimumOrderQuantity: z.number().gt(0, { message: 'Minimum order must be greater than 0' }),
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
}).refine((data) => {
  if (data.minimumOrderQuantity > data.availableQuantity) {
    return false;
  }
  return true;
}, {
  message: 'Minimum order quantity cannot exceed available quantity',
  path: ['minimumOrderQuantity'],
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
  { id: '01', title: 'SUPPLY', desc: 'Quantity & MOQ' },
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
      minimumOrderQuantity: initialListing?.quantity.minimumOrder || 20,
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
    },
  });

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

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const values = form.watch();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Wizard Step Indicator Bar */}
      <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E2DDD5] shadow-2xs">
        <div className="flex items-center justify-between overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {STEPS.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(index)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 ${
                  isCurrent
                    ? 'bg-[#173D32] text-white font-bold'
                    : isCompleted
                    ? 'bg-[#173D32]/10 text-[#173D32] hover:bg-[#173D32]/20 font-medium'
                    : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  isCurrent ? 'bg-white text-[#173D32]' : isCompleted ? 'bg-[#173D32] text-white' : 'bg-stone-200 text-stone-600'
                }`}>
                  {isCompleted ? <Check className="w-3 h-3" /> : step.id}
                </span>
                <span className="hidden sm:inline uppercase">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={(e) => e.preventDefault()} className="bg-white rounded-xl border border-[#E2DDD5] p-6 sm:p-8 shadow-2xs space-y-6">
        {/* Step 01: SUPPLY */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5] pb-4">
              <span className="font-mono text-xs text-[#173D32] font-semibold uppercase tracking-wider">Step 01 • Facility & Quantity</span>
              <h2 className="text-xl font-serif text-[#171A18] font-medium mt-1">Captured CO₂ available for utilization</h2>
              <p className="text-xs text-stone-500 mt-1 font-sans">
                Select your operating facility and specify the available carbon volume.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-stone-600 block mb-1.5">
                  Select Facility Stack *
                </label>
                {facilitiesLoading ? (
                  <p className="text-xs font-mono text-stone-400">Loading facilities...</p>
                ) : facilities.length === 0 ? (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    <AlertTitle className="text-xs font-bold text-amber-900">No Facilities Registered</AlertTitle>
                    <AlertDescription className="text-xs text-amber-800">
                      You must register an industrial facility in your organization profile before declaring supply.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <NativeSelect
                    {...form.register('facilityId')}
                    className="bg-[#FAF8F5] border-[#E2DDD5] font-mono text-xs"
                  >
                    {facilities.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name} — {fac.city}, {fac.state}
                      </option>
                    ))}
                  </NativeSelect>
                )}
                {form.formState.errors.facilityId && (
                  <p className="text-xs text-red-600 mt-1 font-mono">{form.formState.errors.facilityId.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-stone-600 block mb-1.5">
                  Supply Declaration Title *
                </label>
                <Input
                  {...form.register('title')}
                  placeholder="e.g. High-Purity Liquid CO₂ (Food & Industrial Grade)"
                  className="bg-[#FAF8F5] border-[#E2DDD5] text-sm"
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-red-600 mt-1 font-mono">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-stone-600 block mb-1.5">
                    Available Volume *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register('availableQuantity', { valueAsNumber: true })}
                    className="bg-[#FAF8F5] border-[#E2DDD5] text-sm font-mono"
                  />
                  {form.formState.errors.availableQuantity && (
                    <p className="text-xs text-red-600 mt-1 font-mono">{form.formState.errors.availableQuantity.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-stone-600 block mb-1.5">
                    Quantity Unit
                  </label>
                  <NativeSelect {...form.register('quantityUnit')} className="bg-[#FAF8F5] border-[#E2DDD5] text-xs font-mono">
                    <option value="tonne">Metric Tonne (t)</option>
                    <option value="kg">Kilogram (kg)</option>
                  </NativeSelect>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-stone-600 block mb-1.5">
                    Minimum Order Quantity (MOQ) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register('minimumOrderQuantity', { valueAsNumber: true })}
                    className="bg-[#FAF8F5] border-[#E2DDD5] text-sm font-mono"
                  />
                  {form.formState.errors.minimumOrderQuantity && (
                    <p className="text-xs text-red-600 mt-1 font-mono">{form.formState.errors.minimumOrderQuantity.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-stone-600 block mb-1.5">
                  Stream Description & Handling Instructions
                </label>
                <Textarea
                  {...form.register('description')}
                  rows={3}
                  placeholder="Provide technical overview, continuous stream notes, or special transport conditions..."
                  className="bg-[#FAF8F5] border-[#E2DDD5] text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 02: SPECIFICATION */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5] pb-4">
              <span className="font-mono text-xs text-[#173D32] font-semibold uppercase tracking-wider">Step 02 • Composition & Characteristics</span>
              <h2 className="text-xl font-serif text-[#171A18] font-medium mt-1">Specify stream composition & physical characteristics</h2>
              <p className="text-xs text-stone-500 mt-1 font-sans">
                Define the purity, physical state, and process conditions buyers evaluate for feedstock compatibility.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-stone-600 block mb-1.5">
                    CO₂ Concentration / Purity % *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register('purityPercentage', { valueAsNumber: true })}
                    placeholder="99.5"
                    className="bg-[#FAF8F5] border-[#E2DDD5] text-sm font-mono"
                  />
                  <p className="text-[11px] text-stone-400 mt-1 font-mono">Range: 0.01% to 100.00%</p>
                  {form.formState.errors.purityPercentage && (
                    <p className="text-xs text-red-600 mt-1 font-mono">{form.formState.errors.purityPercentage.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-stone-600 block mb-1.5">
                    Physical Form / State *
                  </label>
                  <NativeSelect {...form.register('physicalForm')} className="bg-[#FAF8F5] border-[#E2DDD5] text-xs font-mono">
                    <option value="liquid">Liquid (Cryogenic Tanks)</option>
                    <option value="gaseous">Gaseous (Pipeline / Pressure Vessel)</option>
                    <option value="supercritical">Supercritical (High Pressure)</option>
                    <option value="solid_dry_ice">Solid / Dry Ice Pellets</option>
                  </NativeSelect>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-stone-600 block mb-1.5">
                    Capture Technology / Method
                  </label>
                  <Input
                    {...form.register('captureMethod')}
                    placeholder="e.g. Chemical Amine Absorption, Cryogenic Distillation"
                    className="bg-[#FAF8F5] border-[#E2DDD5] text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-stone-600 block mb-1.5">
                    Capture Source Stream
                  </label>
                  <Input
                    {...form.register('captureSource')}
                    placeholder="e.g. Cement Calcination Kiln, Blast Furnace Off-Gas"
                    className="bg-[#FAF8F5] border-[#E2DDD5] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-stone-600 block mb-1.5">
                    Operating Temperature (°C)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    {...form.register('temperatureCelsius', { valueAsNumber: true })}
                    placeholder="-15"
                    className="bg-[#FAF8F5] border-[#E2DDD5] text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-stone-600 block mb-1.5">
                    Operating Pressure (bar)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    {...form.register('pressureBar', { valueAsNumber: true })}
                    placeholder="25"
                    className="bg-[#FAF8F5] border-[#E2DDD5] text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 03: COMMERCIAL */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5] pb-4">
              <span className="font-mono text-xs text-[#173D32] font-semibold uppercase tracking-wider">Step 03 • Commercial Terms</span>
              <h2 className="text-xl font-serif text-[#171A18] font-medium mt-1">Set commercial terms for this supply</h2>
              <p className="text-xs text-stone-500 mt-1 font-sans">
                Define the off-take unit pricing and trading currency.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-stone-600 block mb-1.5">
                  Price per Unit (₹ / tonne) *
                </label>
                <Input
                  type="number"
                  step="1"
                  {...form.register('pricePerUnit', { valueAsNumber: true })}
                  className="bg-[#FAF8F5] border-[#E2DDD5] text-sm font-mono"
                />
                {form.formState.errors.pricePerUnit && (
                  <p className="text-xs text-red-600 mt-1 font-mono">{form.formState.errors.pricePerUnit.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-stone-600 block mb-1.5">
                  Currency
                </label>
                <NativeSelect {...form.register('currency')} className="bg-[#FAF8F5] border-[#E2DDD5] text-xs font-mono">
                  <option value="INR">INR (₹ Indian Rupee)</option>
                  <option value="USD">USD ($ US Dollar)</option>
                </NativeSelect>
              </div>
            </div>
          </div>
        )}

        {/* Step 04: AVAILABILITY */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5] pb-4">
              <span className="font-mono text-xs text-[#173D32] font-semibold uppercase tracking-wider">Step 04 • Availability Timeline</span>
              <h2 className="text-xl font-serif text-[#171A18] font-medium mt-1">Choose when this volume becomes available</h2>
              <p className="text-xs text-stone-500 mt-1 font-sans">
                Specify the start and optional expiration dates for this supply stream.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-stone-600 block mb-1.5">
                  Available From Date *
                </label>
                <Input
                  type="date"
                  {...form.register('availableFrom')}
                  className="bg-[#FAF8F5] border-[#E2DDD5] text-xs font-mono"
                />
                {form.formState.errors.availableFrom && (
                  <p className="text-xs text-red-600 mt-1 font-mono">{form.formState.errors.availableFrom.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-stone-600 block mb-1.5">
                  Available Until Date (Optional)
                </label>
                <Input
                  type="date"
                  {...form.register('availableUntil')}
                  className="bg-[#FAF8F5] border-[#E2DDD5] text-xs font-mono"
                />
                <p className="text-[10px] text-stone-400 mt-1">Leave empty for continuous supply availability</p>
                {form.formState.errors.availableUntil && (
                  <p className="text-xs text-red-600 mt-1 font-mono">{form.formState.errors.availableUntil.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 05: DELIVERY */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5] pb-4">
              <span className="font-mono text-xs text-[#173D32] font-semibold uppercase tracking-wider">Step 05 • Delivery & Pickup Options</span>
              <h2 className="text-xl font-serif text-[#171A18] font-medium mt-1">Configure logistics availability</h2>
              <p className="text-xs text-stone-500 mt-1 font-sans">
                Indicate whether ISO tanker dispatch delivery or facility gate pickup is offered.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#FAF8F5] border border-[#E2DDD5]">
                <div>
                  <p className="text-sm font-medium text-[#171A18]">Delivery Available (ISO Tanker Dispatch)</p>
                  <p className="text-xs text-stone-500">Enable logistics network delivery directly to utilizer facilities.</p>
                </div>
                <Switch
                  checked={form.watch('deliveryAvailable')}
                  onCheckedChange={(checked) => form.setValue('deliveryAvailable', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-[#FAF8F5] border border-[#E2DDD5]">
                <div>
                  <p className="text-sm font-medium text-[#171A18]">Facility Gate Pickup Available</p>
                  <p className="text-xs text-stone-500">Allow buyers or freight partners to pick up directly at your facility gate.</p>
                </div>
                <Switch
                  checked={form.watch('pickupAvailable')}
                  onCheckedChange={(checked) => form.setValue('pickupAvailable', checked)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 06: VERIFICATION & DOCUMENTS */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5] pb-4">
              <span className="font-mono text-xs text-[#173D32] font-semibold uppercase tracking-wider">Step 06 • Technical Certificates</span>
              <h2 className="text-xl font-serif text-[#171A18] font-medium mt-1">Add certificates or technical documentation</h2>
              <p className="text-xs text-stone-500 mt-1 font-sans">
                Supporting verification documents strengthen buyer confidence and accelerate off-take approval.
              </p>
            </div>

            <div className="p-6 bg-[#FAF8F5] rounded-xl border border-[#E2DDD5] space-y-4 text-xs font-mono text-stone-600">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#173D32] shrink-0" />
                <div>
                  <p className="font-bold text-[#171A18] text-sm font-sans">Verification Metadata Association</p>
                  <p className="text-stone-500 text-xs font-sans mt-0.5">
                    Your facility's registered GPCB environmental permits and ISO 14064 verification certificates will be automatically attached upon declaration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 07: REVIEW & PREVIEW */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5] pb-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-[#173D32] font-semibold uppercase tracking-wider">Step 07 • Review Declaration</span>
                <h2 className="text-xl font-serif text-[#171A18] font-medium mt-1">Final CO₂ Supply Declaration Preview</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#173D32]/10 border border-[#173D32]/20 text-[#173D32] font-mono text-xs rounded-full">
                <Sparkles className="w-3.5 h-3.5" /> Declaration Ready
              </span>
            </div>

            {/* Industrial Specification Sheet Declaration Card */}
            <div className="bg-[#FAF8F5] border border-[#E2DDD5] p-6 rounded-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DDD5] pb-4">
                <div>
                  <h3 className="font-serif text-2xl text-[#171A18] font-medium">{values.title}</h3>
                  <p className="font-mono text-xs text-stone-500 mt-1">
                    State: <span className="font-bold text-[#171A18] uppercase">{values.physicalForm}</span> • Purity: <span className="font-bold text-[#173D32]">{values.purityPercentage}%</span>
                  </p>
                </div>

                <div className="font-mono text-right">
                  <p className="text-xs text-stone-500 uppercase">Unit Commercial Rate</p>
                  <p className="text-xl font-bold text-[#171A18]">₹{values.pricePerUnit} <span className="text-xs font-normal text-stone-500">/ {values.quantityUnit}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                <div>
                  <span className="text-stone-500 uppercase text-[10px]">Volume</span>
                  <span className="font-bold text-[#171A18] block">{values.availableQuantity} {values.quantityUnit}s</span>
                </div>
                <div>
                  <span className="text-stone-500 uppercase text-[10px]">Minimum Order</span>
                  <span className="font-bold text-[#171A18] block">{values.minimumOrderQuantity} {values.quantityUnit}s</span>
                </div>
                <div>
                  <span className="text-stone-500 uppercase text-[10px]">Delivery</span>
                  <span className="font-bold text-[#173D32] block">{values.deliveryAvailable ? 'Yes (ISO Tanker)' : 'No'}</span>
                </div>
                <div>
                  <span className="text-stone-500 uppercase text-[10px]">Pickup</span>
                  <span className="font-bold text-[#173D32] block">{values.pickupAvailable ? 'Yes (Gate)' : 'No'}</span>
                </div>
              </div>

              {values.description && (
                <div className="border-t border-[#E2DDD5] pt-4 text-xs text-stone-600">
                  <span className="font-mono text-[10px] uppercase text-stone-500 block mb-1">Handling Description</span>
                  {values.description}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation Controls */}
        <div className="border-t border-[#E2DDD5] pt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0 || isSubmitting}
            className="border-[#E2DDD5] text-xs gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="border-[#E2DDD5] text-xs gap-1.5 font-mono"
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
                className="bg-[#173D32] hover:bg-[#123027] text-white font-mono text-xs gap-1.5 px-5"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handlePublish}
                disabled={isSubmitting}
                className="bg-[#173D32] hover:bg-[#123027] text-white font-mono text-xs gap-1.5 px-6 font-bold"
              >
                <Send className="w-3.5 h-3.5" /> {isSubmitting ? 'Publishing...' : 'Publish Listing'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
