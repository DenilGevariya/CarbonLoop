import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { BuyerRequirement, CreateRequirementInput } from '../types/requirement';
import { useUtilizationTypes } from '../hooks/useRequirements';
import { UtilizationSelector } from './UtilizationSelector';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
} from 'lucide-react';

const formSchema = z.object({
  title: z
    .string()
    .min(3, 'Requirement title must be at least 3 characters')
    .max(255, 'Title cannot exceed 255 characters'),
  description: z.string().optional(),
  utilization_type_id: z.string().optional(),
  intended_use: z.string().optional(),
  required_quantity: z
    .number()
    .positive('Quantity must be greater than 0'),
  quantity_unit: z.string().default('tonne'),
  minimum_purity: z
    .number()
    .min(0.01, 'Purity must be > 0')
    .max(100, 'Purity cannot exceed 100%'),
  maximum_purity: z
    .number()
    .min(0.01, 'Purity must be > 0')
    .max(100, 'Purity cannot exceed 100%')
    .optional(),
  acceptable_physical_form: z.string().default('liquid'),
  preferred_capture_method: z.string().optional(),
  maximum_price_per_unit: z
    .number()
    .min(0, 'Maximum price cannot be negative')
    .optional(),
  currency: z.string().default('INR'),
  required_from: z.string().optional(),
  required_until: z.string().optional(),
  delivery_required: z.boolean().default(true),
  destination_facility_id: z.string().optional(),
  location_city: z.string().optional(),
  location_state: z.string().optional(),
  priority: z.enum(['normal', 'high', 'urgent']).default('normal'),
});

type FormData = z.infer<typeof formSchema>;

interface RequirementFormProps {
  initialData?: BuyerRequirement;
  onSubmit: (data: CreateRequirementInput, publishNow: boolean) => Promise<void>;
  isSubmitting?: boolean;
}

const STEPS = [
  { id: 1, name: '01. Need', label: 'Requirement Overview' },
  { id: 2, name: '02. Volume & Purity', label: 'Feedstock Specification' },
  { id: 3, name: '03. Utilization', label: 'Pathway Selection' },
  { id: 4, name: '04. Commercial', label: 'Budget & Currency' },
  { id: 5, name: '05. Timing & Destination', label: 'Location & Delivery' },
  { id: 6, name: '06. Review', label: 'Confirm & Publish' },
];

export const RequirementForm: React.FC<RequirementFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting = false,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [facilities, setFacilities] = useState<Array<{ id: string; name: string; city: string; state: string }>>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);

  const { data: utilizationTypes = [] } = useUtilizationTypes();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      utilization_type_id: initialData?.utilization_type_id || '',
      intended_use: initialData?.intended_use || '',
      required_quantity: initialData?.required_quantity || 300,
      quantity_unit: initialData?.quantity_unit || 'tonne',
      minimum_purity: initialData?.minimum_purity || 99.0,
      maximum_purity: initialData?.maximum_purity ?? undefined,
      acceptable_physical_form: initialData?.acceptable_physical_form || 'liquid',
      preferred_capture_method: initialData?.preferred_capture_method || '',
      maximum_price_per_unit: initialData?.maximum_price_per_unit ?? undefined,
      currency: initialData?.currency || 'INR',
      required_from: initialData?.required_from ? initialData.required_from.split('T')[0] : '',
      required_until: initialData?.required_until ? initialData.required_until.split('T')[0] : '',
      delivery_required: initialData?.delivery_required ?? true,
      destination_facility_id: initialData?.destination_facility_id || '',
      location_city: initialData?.location_city || '',
      location_state: initialData?.location_state || '',
      priority: initialData?.priority || 'normal',
    },
  });

  const formValues = watch();

  // Load facility options for logged in buyer
  useEffect(() => {
    async function loadFacilities() {
      try {
        setFacilitiesLoading(true);
        const res = await apiRequest('/organizations/my-facilities');
        if (res.success && res.data) {
          setFacilities(res.data);
          if (!initialData && res.data.length > 0) {
            setValue('destination_facility_id', res.data[0].id);
            setValue('location_city', res.data[0].city);
            setValue('location_state', res.data[0].state);
          }
        }
      } catch (err) {
        console.error('Failed to load facilities:', err);
      } finally {
        setFacilitiesLoading(false);
      }
    }
    loadFacilities();
  }, [initialData, setValue]);

  // Handle facility selection
  const handleFacilityChange = (facilityId: string | null) => {
    if (!facilityId) return;
    setValue('destination_facility_id', facilityId);
    const selected = facilities.find((f) => f.id === facilityId);
    if (selected) {
      setValue('location_city', selected.city);
      setValue('location_state', selected.state);
    }
  };

  const handleNextStep = async () => {
    let valid = false;
    if (currentStep === 1) {
      valid = await trigger(['title', 'description']);
    } else if (currentStep === 2) {
      valid = await trigger(['required_quantity', 'minimum_purity', 'maximum_purity', 'acceptable_physical_form']);
    } else if (currentStep === 3) {
      valid = true;
    } else if (currentStep === 4) {
      valid = await trigger(['maximum_price_per_unit', 'priority']);
    } else if (currentStep === 5) {
      valid = await trigger(['destination_facility_id', 'required_from', 'required_until']);
    }

    if (valid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onFinalFormSubmit = async (data: any, publishNow: boolean) => {
    const payload: CreateRequirementInput = {
      title: data.title,
      description: data.description || undefined,
      utilization_type_id: data.utilization_type_id || undefined,
      intended_use: data.intended_use || undefined,
      required_quantity: Number(data.required_quantity),
      quantity_unit: data.quantity_unit,
      minimum_purity: Number(data.minimum_purity),
      maximum_purity: data.maximum_purity ? Number(data.maximum_purity) : undefined,
      acceptable_physical_form: data.acceptable_physical_form || undefined,
      preferred_capture_method: data.preferred_capture_method || undefined,
      maximum_price_per_unit: data.maximum_price_per_unit ? Number(data.maximum_price_per_unit) : undefined,
      currency: data.currency,
      required_from: data.required_from || undefined,
      required_until: data.required_until || undefined,
      delivery_required: data.delivery_required,
      destination_facility_id: data.destination_facility_id || undefined,
      location_city: data.location_city || undefined,
      location_state: data.location_state || undefined,
      priority: data.priority,
      status: publishNow ? 'PUBLISHED' : 'DRAFT',
    };

    await onSubmit(payload, publishNow);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Step Navigation Header Bar */}
      <div className="bg-white border border-[#E5EAEF] p-4 rounded-xl shadow-xs">
        <div className="flex items-center justify-between overflow-x-auto gap-2 scrollbar-none">
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <button
                type="button"
                key={step.id}
                onClick={() => {
                  if (isCompleted || isActive) setCurrentStep(step.id);
                }}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#5D87FF] text-white font-bold shadow-xs'
                    : isCompleted
                    ? 'bg-[#ECF2FF] text-[#5D87FF] font-semibold hover:bg-[#5D87FF]/20'
                    : 'text-[#5A6A85] bg-[#F6F9FC] hover:bg-[#E5EAEF]'
                }`}
              >
                <span>{step.name}</span>
                {isCompleted && <Check className="w-3.5 h-3.5 text-[#5D87FF]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={(e) => e.preventDefault()} className="bg-white border border-[#E5EAEF] p-6 sm:p-8 rounded-xl shadow-xs space-y-6">
        {/* STEP 1: Overview */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-[#5D87FF] uppercase tracking-wider bg-[#ECF2FF] px-2.5 py-1 rounded-md block w-fit mb-2">
                Section 01 / Requirement Overview
              </span>
              <h2 className="font-bold text-xl text-[#2A3547]">
                Define Your CO₂ Feedstock Need
              </h2>
              <p className="text-xs text-[#5A6A85] font-medium mt-1">
                State what your manufacturing facility requires so compatible suppliers can evaluate technical feasibility.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] block mb-1.5">
                  Requirement Title *
                </label>
                <Input
                  {...register('title')}
                  placeholder="e.g. High-Purity CO2 Feedstock for Methanol Synthesis"
                  className="bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] rounded-lg focus-visible:ring-[#5D87FF]"
                />
                {errors.title && (
                  <p className="text-xs text-[#FA896B] mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] block mb-1.5">
                  Detailed Operational Description
                </label>
                <Textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Describe your process requirements, continuous off-take schedule, or purity tolerances..."
                  className="bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] rounded-lg focus-visible:ring-[#5D87FF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Volume & Purity */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-[#5D87FF] uppercase tracking-wider bg-[#ECF2FF] px-2.5 py-1 rounded-md block w-fit mb-2">
                Section 02 / Volume & Purity Specifications
              </span>
              <h2 className="font-bold text-xl text-[#2A3547]">
                Set Required Volume and Purity Range
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] block mb-1.5">
                  Required Volume (Tonnes) *
                </label>
                <Input
                  type="number"
                  {...register('required_quantity', { valueAsNumber: true })}
                  className="bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] rounded-lg focus-visible:ring-[#5D87FF]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] block mb-1.5">
                  Minimum Purity (%) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('minimum_purity', { valueAsNumber: true })}
                  className="bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] rounded-lg focus-visible:ring-[#5D87FF]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] block mb-1.5">
                  Maximum Purity Cap (%)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('maximum_purity', { valueAsNumber: true })}
                  placeholder="e.g. 99.9"
                  className="bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] rounded-lg focus-visible:ring-[#5D87FF]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] block mb-1.5">
                  Acceptable Physical Form
                </label>
                <Select
                  value={formValues.acceptable_physical_form}
                  onValueChange={(val) => val && setValue('acceptable_physical_form', val)}
                >
                  <SelectTrigger className="bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5EAEF]">
                    <SelectItem value="liquid">Liquid CO₂</SelectItem>
                    <SelectItem value="gaseous">Compressed Gas</SelectItem>
                    <SelectItem value="supercritical">Supercritical Stream</SelectItem>
                    <SelectItem value="solid_dry_ice">Solid Dry Ice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Utilization Pathway */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-[#5D87FF] uppercase tracking-wider bg-[#ECF2FF] px-2.5 py-1 rounded-md block w-fit mb-2">
                Section 03 / Utilization Pathway
              </span>
              <h2 className="font-bold text-xl text-[#2A3547]">
                Intended Application Taxonomy
              </h2>
              <p className="text-xs text-[#5A6A85] font-medium mt-1">
                Select the utilization pathway for your facility. This structures matching and impact tracking.
              </p>
            </div>

            <UtilizationSelector
              types={utilizationTypes}
              selectedId={formValues.utilization_type_id}
              onSelect={(typeId) => setValue('utilization_type_id', typeId)}
            />

            <div className="text-xs">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] block mb-1.5">
                Specific End-Product or Application Details
              </label>
              <Input
                {...register('intended_use')}
                placeholder="e.g. Accelerating concrete block curing line #2 in Vadodara plant..."
                className="bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] rounded-lg focus-visible:ring-[#5D87FF]"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Commercial */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-[#5D87FF] uppercase tracking-wider bg-[#ECF2FF] px-2.5 py-1 rounded-md block w-fit mb-2">
                Section 04 / Commercial Limits
              </span>
              <h2 className="font-bold text-xl text-[#2A3547]">
                Off-take Budget & Priority Level
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] block mb-1.5">
                  Maximum Acceptable Price per Tonne (INR)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('maximum_price_per_unit', { valueAsNumber: true })}
                  placeholder="e.g. 5200"
                  className="bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] rounded-lg focus-visible:ring-[#5D87FF]"
                />
                <span className="text-[10px] text-[#5A6A85] block mt-1">
                  Ceiling price threshold. Leave blank if open to market quotes.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] block mb-1.5">Urgency / Priority</label>
                <Select
                  value={formValues.priority}
                  onValueChange={(val: any) => setValue('priority', val)}
                >
                  <SelectTrigger className="h-10 text-xs bg-[#F6F9FC] border-[#E5EAEF] rounded-lg text-[#2A3547]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-[#E5EAEF] bg-white">
                    <SelectItem value="normal">Normal Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="urgent">Urgent Procurement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Timing & Destination */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-[#5D87FF] uppercase tracking-wider bg-[#ECF2FF] px-2.5 py-1 rounded-md block w-fit mb-2">
                Section 05 / Timing & Logistics Destination
              </span>
              <h2 className="font-bold text-xl text-[#2A3547]">
                Delivery Window & Destination Facility
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Destination Facility */}
              <div className="md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] block mb-1.5">
                  Destination Off-Take Facility <span className="text-[#FA896B]">*</span>
                </label>

                {facilitiesLoading ? (
                  <p className="text-xs text-[#5A6A85]">Loading registered facilities...</p>
                ) : facilities.length === 0 ? (
                  <div className="p-4 bg-[#FEF5E5] border border-[#FFAE1F]/30 text-[#FFAE1F] text-xs rounded-lg font-medium">
                    No registered off-take facility found for your organization. You can enter location city/state below.
                  </div>
                ) : (
                  <Select
                    value={formValues.destination_facility_id}
                    onValueChange={handleFacilityChange}
                  >
                    <SelectTrigger className="h-10 text-xs bg-[#F6F9FC] border-[#E5EAEF] rounded-lg text-[#2A3547]">
                      <SelectValue placeholder="Select Destination Facility" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-[#E5EAEF] bg-white">
                      {facilities.map((fac) => (
                        <SelectItem key={fac.id} value={fac.id}>
                          {fac.name} — {fac.city}, {fac.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] block mb-1.5">Required From Date</label>
                <Input
                  type="date"
                  {...register('required_from')}
                  className="bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] rounded-lg focus-visible:ring-[#5D87FF]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] block mb-1.5">Required Until Date</label>
                <Input
                  type="date"
                  {...register('required_until')}
                  className="bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] rounded-lg focus-visible:ring-[#5D87FF]"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between p-4 bg-[#F6F9FC] border border-[#E5EAEF] rounded-xl">
                <div className="space-y-0.5">
                  <span className="font-bold text-[#2A3547]">Logistics Delivery Required</span>
                  <p className="text-xs text-[#5A6A85]">
                    Require supplier or CarbonLoop logistics network to transport CO₂ directly to site.
                  </p>
                </div>
                <Controller
                  name="delivery_required"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Review & Final Action */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-[#5D87FF] uppercase tracking-wider bg-[#ECF2FF] px-2.5 py-1 rounded-md block w-fit mb-2">
                Section 06 / Final Review
              </span>
              <h2 className="font-bold text-xl text-[#2A3547]">
                Review Complete Requirement Specification
              </h2>
              <p className="text-xs text-[#5A6A85] mt-0.5">
                Verify all parameters before publishing your requirement to the CarbonLoop CO₂ Network.
              </p>
            </div>

            {/* Organized 5-Section Review Card */}
            <div className="bg-[#F6F9FC] border border-[#E5EAEF] rounded-xl p-6 space-y-6 text-xs">
              {/* 1. REQUIREMENT */}
              <div className="space-y-2 border-b border-[#E5EAEF] pb-4">
                <span className="text-[10px] font-bold uppercase text-[#5D87FF] tracking-wider block">
                  01. REQUIREMENT
                </span>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base text-[#2A3547]">
                      {formValues.title}
                    </h3>
                    <p className="text-xs text-[#5A6A85] mt-1 leading-relaxed">
                      {formValues.description || 'No detailed operational description provided.'}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-[#ECF2FF] text-[#5D87FF] border border-[#5D87FF]/20 text-[10px] uppercase font-bold tracking-wider rounded-full">
                    {formValues.priority} Priority
                  </span>
                </div>
              </div>

              {/* 2. VOLUME & PURITY */}
              <div className="space-y-2 border-b border-[#E5EAEF] pb-4">
                <span className="text-[10px] font-bold uppercase text-[#5D87FF] tracking-wider block">
                  02. VOLUME & PURITY
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-3.5 rounded-lg border border-[#E5EAEF]">
                  <div>
                    <span className="text-[#5A6A85] text-[10px] uppercase block font-semibold">Required Volume</span>
                    <span className="font-bold text-sm text-[#2A3547]">
                      {formValues.required_quantity} {formValues.quantity_unit}s
                    </span>
                  </div>
                  <div>
                    <span className="text-[#5A6A85] text-[10px] uppercase block font-semibold">Minimum Purity</span>
                    <span className="font-bold text-sm text-[#5D87FF]">
                      ≥{formValues.minimum_purity}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[#5A6A85] text-[10px] uppercase block font-semibold">Maximum Purity</span>
                    <span className="font-bold text-sm text-[#2A3547]">
                      {formValues.maximum_purity ? `≤${formValues.maximum_purity}%` : 'Not Capped'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#5A6A85] text-[10px] uppercase block font-semibold">Physical Form</span>
                    <span className="font-bold text-xs text-[#2A3547] uppercase">
                      {formValues.acceptable_physical_form}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. UTILIZATION */}
              <div className="space-y-2 border-b border-[#E5EAEF] pb-4">
                <span className="text-[10px] font-bold uppercase text-[#5D87FF] tracking-wider block">
                  03. UTILIZATION
                </span>
                <div className="bg-white p-3.5 rounded-lg border border-[#E5EAEF] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#2A3547]">
                      {utilizationTypes.find((u: { id: string; name: string }) => u.id === formValues.utilization_type_id)?.name || 'Mineralization & Materials Curing'}
                    </span>
                    <p className="text-[11px] text-[#5A6A85] mt-0.5">
                      {formValues.intended_use || 'Direct chemical or industrial feedstock process consumption.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. COMMERCIAL */}
              <div className="space-y-2 border-b border-[#E5EAEF] pb-4">
                <span className="text-[10px] font-bold uppercase text-[#5D87FF] tracking-wider block">
                  04. COMMERCIAL
                </span>
                <div className="grid grid-cols-2 gap-4 bg-white p-3.5 rounded-lg border border-[#E5EAEF]">
                  <div>
                    <span className="text-[#5A6A85] text-[10px] uppercase block font-semibold">Maximum Acceptable Price</span>
                    <span className="font-bold text-sm text-[#2A3547]">
                      {formValues.maximum_price_per_unit
                        ? `₹${formValues.maximum_price_per_unit.toLocaleString()} / ${formValues.quantity_unit}`
                        : 'Open / Negotiable'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#5A6A85] text-[10px] uppercase block font-semibold">Currency & Settlement</span>
                    <span className="font-bold text-xs text-[#2A3547]">
                      {formValues.currency || 'INR'} (Indian Rupee)
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. TIMING & DESTINATION */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-[#5D87FF] tracking-wider block">
                  05. TIMING & DESTINATION
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-lg border border-[#E5EAEF]">
                  <div>
                    <span className="text-[#5A6A85] text-[10px] uppercase block font-semibold">Destination Location</span>
                    <span className="font-bold text-xs text-[#2A3547]">
                      {formValues.location_city || 'Vadodara'}, {formValues.location_state || 'Gujarat'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#5A6A85] text-[10px] uppercase block font-semibold">Date Window</span>
                    <span className="font-bold text-xs text-[#2A3547]">
                      {formValues.required_from || 'Immediate'} {formValues.required_until ? `to ${formValues.required_until}` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#5A6A85] text-[10px] uppercase block font-semibold">Logistics Required</span>
                    <span className={`font-bold text-xs ${formValues.delivery_required ? 'text-[#5D87FF]' : 'text-[#5A6A85]'}`}>
                      {formValues.delivery_required ? 'Yes (Tanker Delivery Required)' : 'No (Buyer Self-Pickup)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dual Action Buttons */}
            <div className="pt-4 border-t border-[#E5EAEF] flex flex-col sm:flex-row items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={handleSubmit((data) => onFinalFormSubmit(data, false))}
                className="w-full sm:w-auto border-[#E5EAEF] text-[#5A6A85] font-semibold text-xs h-10 px-6 rounded-lg cursor-pointer"
              >
                Save Draft Only
              </Button>

              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit((data) => onFinalFormSubmit(data, true))}
                className="w-full sm:w-auto bg-[#5D87FF] hover:bg-[#4570EA] text-white text-xs font-semibold h-10 px-8 rounded-lg cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Publishing...' : 'Publish to Demand Network'}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Step Navigation Footer */}
        {currentStep < 6 && (
          <div className="pt-6 mt-6 border-t border-[#E5EAEF] flex items-center justify-between text-xs">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="border-[#E5EAEF] text-[#5A6A85] font-semibold rounded-lg h-9 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous Step
            </Button>

            <Button
              type="button"
              onClick={handleNextStep}
              className="bg-[#5D87FF] hover:bg-[#4570EA] text-white rounded-lg h-9 text-xs px-6 font-semibold cursor-pointer"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};
