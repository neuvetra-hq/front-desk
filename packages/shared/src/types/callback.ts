export type CallbackStatus = "pending" | "completed" | "cancelled";

export interface Callback {
  id: string;
  tenant_id: string;
  customer_id: string;
  call_id: string | null;
  customer_name: string;
  customer_phone: string;
  preferred_time: string | null;
  reason: string | null;
  status: CallbackStatus;
  created_at: string;
}
