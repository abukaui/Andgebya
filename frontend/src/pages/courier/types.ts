export interface CourierProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  is_available: boolean;
  kyc_status: string;
  bond_amount: number | string;
  is_verified: boolean;
  last_active: string | null;
  lat: number | null;
  lng: number | null;
  profile_image_url?: string;
  settings?: any;
  balance?: number;
  rating?: number;
  completed_deliveries?: number;
  total_earnings?: number;
  total_hours?: number;
}

export interface GeoCoords {
  lat: number;
  lng: number;
}
