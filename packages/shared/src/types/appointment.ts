export type AppointmentStatus = "pending" | "confirmed" | "cancelled";

export interface Appointment {
  id: string;
  tenant_id: string;
  customer_id: string;
  call_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_type: string;
  job_notes: string | null;
  scheduled_at: string;
  status: AppointmentStatus;
  calendar_event_id: string | null;
  created_at: string;
}
