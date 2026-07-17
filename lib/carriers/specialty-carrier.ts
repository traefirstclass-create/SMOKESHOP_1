// Adapter interface for the PACT-Act-compliant specialty carrier that
// RESTRICTED_DTC shipments require (standard USPS/UPS/FedEx refuse these
// products categorically). No specific carrier is selected yet — see
// COMPLIANCE.md. Plug a real implementation in by swapping
// getSpecialtyCarrier()'s return value once one is chosen.

import type { ShippingAddress } from "@/lib/types";

export type SpecialtyShipmentRequest = {
  orderId: string;
  shipTo: ShippingAddress;
  items: { productName: string; quantity: number }[];
};

export type SpecialtyShipmentResult = {
  success: boolean;
  trackingNumber?: string;
  adultSignatureRequired: true;
  error?: string;
};

export interface SpecialtyCarrierAdapter {
  createShipment(request: SpecialtyShipmentRequest): Promise<SpecialtyShipmentResult>;
}

// Default: no carrier is wired up yet. Every RESTRICTED_DTC order is still
// recorded correctly (fulfillment_type, compliance_category_snapshot, state
// allowlist check) — this adapter just means nothing auto-books a real
// shipment yet. Fulfillment staff currently need to arrange RESTRICTED_DTC
// shipping manually once a specialty carrier is selected and this adapter is
// swapped for a real implementation.
class NotConfiguredCarrierAdapter implements SpecialtyCarrierAdapter {
  async createShipment(): Promise<SpecialtyShipmentResult> {
    return {
      success: false,
      adultSignatureRequired: true,
      error: "No specialty carrier is configured yet. See lib/carriers/specialty-carrier.ts.",
    };
  }
}

export function getSpecialtyCarrier(): SpecialtyCarrierAdapter {
  return new NotConfiguredCarrierAdapter();
}
