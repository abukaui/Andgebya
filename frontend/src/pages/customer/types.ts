export interface Shop {
  id: string;
  name: string;
  address: string;
  rating: number;
  is_active: boolean;
  lat?: number;
  lng?: number;
}

export interface CatalogProduct {
  id: string;
  shop_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
  shop_name: string;
  shop_address: string;
  shop_rating: number;
  lat: number;
  lng: number;
}

export interface DeliveryRequest {
  id: string;
  status: 'pending' | 'matched' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_fee: number;
  platform_fee: number;
  created_at: string;
  matched_at?: string;
  delivered_at?: string;
  shop_name: string;
  courier_name?: string;
  courier_phone?: string;
}

export interface CustomerProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  profile_image_url?: string;
}
