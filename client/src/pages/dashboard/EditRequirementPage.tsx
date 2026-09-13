import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRequirement, useUpdateRequirement } from '@/features/requirements/hooks/useRequirements';
import { RequirementForm } from '@/features/requirements/components/RequirementForm';
import type { CreateRequirementInput } from '@/features/requirements/types/requirement';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';

export const EditRequirementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: requirement, isLoading } = useRequirement(id);
  const updateMutation = useUpdateRequirement();

  const handleSubmit = async (data: CreateRequirementInput, publishNow: boolean) => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          ...data,
          status: publishNow ? 'PUBLISHED' : requirement?.status || 'DRAFT',
        },
      });
      toast.add({
        title: publishNow ? 'Requirement published' : 'Requirement updated',
        description: publishNow
          ? 'Your CO₂ demand requirement is now visible to emitters.'
          : 'Your CO₂ demand requirement was updated successfully.',
        type: 'success',
      });
      navigate('/dashboard/requirements');
    } catch (err: any) {
      console.error('Failed to update requirement:', err);
      toast.add({
        title: publishNow ? 'Unable to publish requirement' : 'Unable to update requirement',
        description: err instanceof Error ? err.message : 'Please try again.',
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64 bg-stone-200" />
        <Skeleton className="h-96 w-full bg-stone-200" />
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-stone-800">Requirement Not Found</h2>
        <Button onClick={() => navigate('/dashboard/requirements')}>Back to Requirements</Button>
      </div>
    );
  }

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
          <div className="flex items-center gap-3">
            <h1 className="font-sans font-bold text-2xl text-[#171A18]">
              Edit Requirement {requirement.requirement_code}
            </h1>
          </div>
        </div>
      </div>

      <RequirementForm
        initialData={requirement}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
};

export default EditRequirementPage;
