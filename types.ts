export interface Variant {
  id: string;
  name: string;
  isOutOfStock?: boolean;
}

export interface DiscountTier {
  id: number; // Used for React keys in the form
  quantity: number;
  value: number; // The discount amount (either percentage rate or fixed value)
  type: 'percentage' | 'value'; // The type of discount
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
  variants?: Variant[];
  isOutOfStock?: boolean;
  discounts?: DiscountTier[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  name: string;
  whatsapp: string; // Used as document ID
  status: 'pending' | 'approved';
}
