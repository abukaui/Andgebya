export interface Shop { id: string; name: string; address: string; rating: number; is_active: boolean; }
export interface Product { 
  id: string; 
  name: string; 
  description: string; 
  price: number | string; 
  category: 'Food' | 'Drink' | 'Other';
  image_url: string; 
  is_available: boolean; 
}
export interface Order { id: string; status: string; total_amount: number | string; customer_name: string; customer_phone: string; created_at: string; }
export interface UserProfile { id: string; email: string; full_name: string; phone_number: string; role: string; }
