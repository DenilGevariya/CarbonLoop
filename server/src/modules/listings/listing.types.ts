export type ListingStatus = 
  | 'DRAFT' 
  | 'PUBLISHED' 
  | 'PAUSED' 
  | 'EXHAUSTED' 
  | 'EXPIRED' 
  | 'ARCHIVED';

export type PhysicalForm = 
  | 'GASEOUS' 
  | 'LIQUID' 
  | 'SUPERCRITICAL' 
  | 'SOLID_DRY_ICE'
  | 'gaseous'
  | 'liquid'
  | 'supercritical'
  | 'solid_dry_ice';

export interface ListingDTO {
  id: string;
  listingCode: string;
  title: string;
  description: string | null;
  organization: {
    id: string;
    name: string;
    slug: string | null;
    orgType: string;
    verificationStatus: string;
    logoUrl?: string | null;
  };
  facility: {
    id: string;
    name: string;
    facilityCode: string | null;
    city: string;
    state: string;
    country: string;
  };
  quantity: {
    available: number;
    remaining: number;
    minimumOrder: number;
    unit: string;
  };
  purityPercentage: number;
  physicalForm: string;
  captureMethod: string | null;
  captureSource: string | null;
  temperatureCelsius: number | null;
  pressureBar: number | null;
  price: {
    amount: number;
    currency: string;
  };
  availability: {
    from: string;
    until: string | null;
  };
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  verificationStatus?: string;
  labReportUrl?: string | null;
  labReportFilename?: string | null;
  verificationNotes?: string | null;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  documents?: ListingDocumentDTO[];
  statusHistory?: ListingStatusHistoryDTO[];
}

export interface ListingDocumentDTO {
  id: string;
  name: string;
  type: string;
  mimeType: string;
  fileSize: number;
  description: string | null;
  verificationStatus: string;
  uploadedAt: string;
}

export interface ListingStatusHistoryDTO {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: {
    id: string;
    name: string;
  } | null;
  reason: string | null;
  createdAt: string;
}

export interface ListingFilterParams {
  search?: string;
  location?: string;
  organizationId?: string;
  facilityId?: string;
  minQuantity?: number;
  maxQuantity?: number;
  minPurity?: number;
  maxPurity?: number;
  minPrice?: number;
  maxPrice?: number;
  physicalForm?: string;
  status?: string;
  availableFrom?: string;
  availableUntil?: string;
  deliveryAvailable?: boolean;
  pickupAvailable?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface MarketplaceStatsDTO {
  activeListings: number;
  totalAvailableQuantity: number;
  averagePurity: number;
  activeRegions: number;
}

export interface EmitterSupplyStatsDTO {
  activeListings: number;
  draftListings: number;
  pausedListings: number;
  totalListedTonnes: number;
  totalRemainingTonnes: number;
}

export interface CreateListingInput {
  facilityId: string;
  title: string;
  description?: string;
  availableQuantity: number;
  quantityUnit?: string;
  minimumOrderQuantity?: number;
  purityPercentage: number;
  physicalForm: PhysicalForm;
  captureMethod?: string;
  captureSource?: string;
  temperatureCelsius?: number;
  pressureBar?: number;
  pricePerUnit: number;
  currency?: string;
  availableFrom: string;
  availableUntil?: string;
  deliveryAvailable?: boolean;
  pickupAvailable?: boolean;
  labReportUrl?: string;
  labReportFilename?: string;
  publishNow?: boolean;
}

export interface UpdateListingInput {
  title?: string;
  description?: string;
  availableQuantity?: number;
  minimumOrderQuantity?: number;
  purityPercentage?: number;
  physicalForm?: PhysicalForm;
  captureMethod?: string;
  captureSource?: string;
  temperatureCelsius?: number;
  pressureBar?: number;
  pricePerUnit?: number;
  currency?: string;
  availableFrom?: string;
  availableUntil?: string;
  deliveryAvailable?: boolean;
  pickupAvailable?: boolean;
  labReportUrl?: string;
  labReportFilename?: string;
  verificationStatus?: string;
  verificationNotes?: string;
}
