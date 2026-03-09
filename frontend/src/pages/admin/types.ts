export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin';
}

export interface PaymentRecord {
  id: string;
  transaction_id: string;
  payment_method: 'telebirr' | 'cbe_birr';
  total_paid: number | string;
  merchant_share: number | string;
  courier_share: number | string;
  platform_fee: number | string;
  status: 'held_in_escrow' | 'released' | 'refunded';
  created_at: string;
  delivery_status: string;
  customer_name: string;
  courier_name: string | null;
  shop_name: string;
}

export interface AdminCourier {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  vehicle_type: string;
  bond_amount: number | string;
  is_verified: boolean;
  is_available: boolean;
}
