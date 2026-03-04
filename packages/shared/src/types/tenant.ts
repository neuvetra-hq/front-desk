export type TenantRole = "owner" | "staff";

export type CalendarProvider = "google" | "calcom";

export type Industry = "general_contractor";

export interface BusinessHours {
  open: string;  // HH:mm
  close: string; // HH:mm
  closed: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  industry: Industry;
  phone: string;
  calendar_provider: CalendarProvider;
  /** Per-day business hours keyed by lowercase day name */
  business_hours: Record<string, BusinessHours>;
  timezone: string;
  created_at: string;
}

export interface TenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  role: TenantRole;
  created_at: string;
}
