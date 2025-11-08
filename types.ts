export interface Variant {
  id: string;
  name: string;
  isOutOfStock?: boolean;
}

export interface DiscountTier {
  // Fix: Made 'id' optional as it is a UI concern for React keys and not stored in the database.
  id?: number; // Used for React keys in the form
  quantity: number;
  value: number; // The discount amount (either percentage rate or fixed value)
  type: 'percentage' | 'value'; // The type of discount
}

export interface Product {
  id:string;
  name: string;
  marca: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
  variants?: Variant[];
  isOutOfStock?: boolean;
  discounts?: DiscountTier[];
  isFeatured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  name: string;
  whatsapp: string; // Used as document ID
  status: 'pending' | 'approved';
}