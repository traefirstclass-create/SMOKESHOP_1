export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
};

// Compliance taxonomy — see COMPLIANCE.md for what each category means and
// where it's configured. DO_NOT_SELL is the safe default for any new or
// unreviewed SKU; only a human can move a product out of it.
export type ComplianceCategory =
  | "FREE_SHIP"
  | "PICKUP_ONLY"
  | "RESTRICTED_DTC"
  | "WHOLESALE_ONLY"
  | "DO_NOT_SELL";

export const COMPLIANCE_CATEGORIES: ComplianceCategory[] = [
  "FREE_SHIP",
  "PICKUP_ONLY",
  "RESTRICTED_DTC",
  "WHOLESALE_ONLY",
  "DO_NOT_SELL",
];

// Categories a general storefront visitor can ever see/buy. DO_NOT_SELL and
// WHOLESALE_ONLY are deliberately excluded here and filtered out at the query
// layer (lib/catalog.ts) and at the database layer (RLS), not just hidden
// in the UI.
export const SELLABLE_STOREFRONT_CATEGORIES: ComplianceCategory[] = [
  "FREE_SHIP",
  "PICKUP_ONLY",
  "RESTRICTED_DTC",
];

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  categorySlug: string;
  brand: string;
  imageSeed: string;
  inStock: boolean;
  featured: boolean;
  complianceCategory: ComplianceCategory;
  needsLegalReview: boolean;
  lastComplianceReviewDate: string | null;
  reviewedBy: string | null;
  complianceExpiresOn: string | null;
  complianceNotes: string;
};

export type PickupLocation = {
  id: string;
  name: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  isActive: boolean;
};

export type StateRegistration = {
  state: string;
  atfRegistered: boolean;
  taxRegistered: boolean;
  carrierReady: boolean;
  notes: string;
  updatedAt: string;
};

export type TradeApplication = {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  resaleCertNumber: string;
  businessLicenseNumber: string;
  notes: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type ComplianceAuditLogEntry = {
  id: string;
  entityType: "product" | "checkout" | "state_registration" | "trade_application";
  entityId: string;
  action: string;
  previousValue: unknown;
  newValue: unknown;
  reason: string;
  performedBy: string | null;
  createdAt: string;
};

export type BannedTerm = {
  id: string;
  phrase: string;
  category: "health_claim" | "paraphernalia_framing" | "minor_targeting";
  severity: "warn" | "block";
  notes: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type ShippingAddress = {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
};

export type OrderItemRecord = {
  productName: string;
  quantity: number;
  priceCents: number;
};

export type Order = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: ShippingAddress;
  subtotalCents: number;
  totalCents: number;
  status: string;
  authorizeNetTransactionId: string | null;
  createdAt: string;
  items: OrderItemRecord[];
};
