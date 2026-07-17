"use server";

import { createTradeApplication } from "@/lib/compliance/trade-applications";

export async function submitTradeApplicationAction(input: {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  resaleCertNumber: string;
  businessLicenseNumber: string;
  notes: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!input.businessName.trim() || !input.contactName.trim() || !input.email.trim()) {
    return { success: false, error: "Business name, contact name, and email are required." };
  }
  return createTradeApplication(input);
}
