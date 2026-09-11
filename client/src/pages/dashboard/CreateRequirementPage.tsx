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
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-4">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/requirements')}
            className="text-xs font-mono text-stone-600 hover:text-[#171A18] px-0 mb-2 h-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Demand Management
          </Button>
          <h1 className="font-sans font-bold text-2xl text-[#171A18]">
            Declare New CO₂ Requirement
          </h1>
          <p className="font-sans text-xs text-stone-600 mt-0.5">
            Specify your facility's feedstock volume, purity requirements, and destination details.
          </p>
        </div>
      </div>

      <RequirementForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
    </div>
  );
};

export default CreateRequirementPage;
