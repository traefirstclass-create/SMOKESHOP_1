export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
};

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
