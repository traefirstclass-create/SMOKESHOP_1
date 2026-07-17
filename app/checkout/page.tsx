import { CheckoutForm } from "@/components/CheckoutForm";
import { getActivePickupLocations } from "@/lib/compliance/pickup-locations";

export default async function CheckoutPage() {
  const pickupLocations = await getActivePickupLocations();
  return <CheckoutForm pickupLocations={pickupLocations} />;
}
