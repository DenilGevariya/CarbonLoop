export type RequirementStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'FULFILLED'
  | 'EXPIRED'
  | 'ARCHIVED';

export type RequirementPriority = 'normal' | 'high' | 'urgent';

export interface UtilizationType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface BuyerRequirement {
  id: string;
  organization_id: string;
  requirement_code: string;
  title: string;
  description: string | null;
  required_quantity: number;
  quantity_unit: string;
  minimum_purity: number;
  maximum_purity: number | null;
  acceptable_physical_form: string | null;
  preferred_capture_method: string | null;
  maximum_price_per_unit: number | null;
  currency: string;
  required_from: string | null;
  required_until: string | null;
  delivery_required: boolean;
  destination_facility_id: string | null;
  priority: RequirementPriority;
  status: RequirementStatus;
  created_by: string | null;
  utilization_type_id: string | null;
  intended_use: string | null;
  location_city: string | null;
  location_state: string | null;
  created_at: string;
  updated_at: string;

  organization?: {
    id: string;
    name: string;
    slug?: string;
    organization_type?: string;
    verification_status?: string;
  };
  destination_facility?: {
    id: string;
    name: string;
    facility_code?: string;
    facility_type?: string;
    city: string;
    state: string;
    country: string;
    address_line1?: string;
  };
  utilization?: {
    id: string;
    code: string;
    name: string;
    description: string | null;
  };
  creator?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface RequirementFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  utilization_code?: string;
  utilization_type_id?: string;
  physical_form?: string;
  priority?: string;
  min_purity?: number;
  max_price?: number;
  city?: string;
  state?: string;
  organization_id?: string;
  sort?: string;
}

export interface CreateRequirementInput {
  title: string;
  description?: string;
  utilization_type_id?: string;
  intended_use?: string;
  required_quantity: number;
  quantity_unit?: string;
  minimum_purity: number;
  maximum_purity?: number;
  acceptable_physical_form?: string;
  preferred_capture_method?: string;
  maximum_price_per_unit?: number;
  currency?: string;
  required_from?: string;
  required_until?: string;
  delivery_required?: boolean;
  destination_facility_id?: string;
  location_city?: string;
  location_state?: string;
  priority?: RequirementPriority;
  status?: RequirementStatus;
}

export interface UpdateRequirementInput extends Partial<CreateRequirementInput> {}

export interface DemandStats {
  activeRequirements: number;
  totalRequestedQuantity: number;
  averageMinimumPurity: number;
  activeRegionsCount: number;
  utilizationBreakdown: Array<{
    code: string;
    name: string;
    count: number;
    totalQuantity: number;
    percentage: number;
  }>;
}
