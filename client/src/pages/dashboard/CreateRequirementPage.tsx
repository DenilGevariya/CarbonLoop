import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRequirement } from '@/features/requirements/hooks/useRequirements';
import { RequirementForm } from '@/features/requirements/components/RequirementForm';
import type { CreateRequirementInput } from '@/features/requirements/types/requirement';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CreateRequirementPage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateRequirement();

  const handleSubmit = async (data: CreateRequirementInput, publishNow: boolean) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        status: publishNow ? 'PUBLISHED' : 'DRAFT',
      });
      navigate('/dashboard/requirements');
    } catch (err: any) {
      console.error('Failed to create requirement:', err);
    }
  };

  return (
    <div className="p-2 sm:p-4 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-[#E5EAEF] pb-4">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/requirements')}
            className="text-xs font-semibold text-[#5A6A85] hover:text-[#5D87FF] hover:bg-[#ECF2FF] px-2 mb-2 h-8 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Demand Management
          </Button>
          <h1 className="font-bold text-2xl text-[#2A3547] tracking-tight">
            Declare New CO₂ Requirement
          </h1>
          <p className="text-xs text-[#5A6A85] font-medium mt-0.5">
            Specify your facility's feedstock volume, purity requirements, and destination details.
          </p>
        </div>
      </div>

      <RequirementForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
    </div>
  );
};

export default CreateRequirementPage;
