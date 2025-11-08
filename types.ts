export interface Variant {
  id: number;
  name: string;
  isOutOfStock?: boolean;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
  variants?: Variant[];
  isOutOfStock?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  name: string;
  whatsapp: string;
  status: 'pending' | 'approved';
}