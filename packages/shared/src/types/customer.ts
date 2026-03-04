export interface Customer {
  id: string;
  tenant_id: string;
  full_name: string;
  email: string | null;
  phone: string;
  notes: string | null;
  first_seen_at: string;
  last_seen_at: string;
  call_count: number;
  created_at: string;
}
