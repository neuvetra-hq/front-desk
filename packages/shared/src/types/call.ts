export type CallOutcome =
  | "booked"
  | "faq_resolved"
  | "transferred"
  | "callback_scheduled"
  | "missed";

export interface Call {
  id: string;
  tenant_id: string;
  customer_id: string | null; // nullable — first-time callers
  retell_call_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  outcome: CallOutcome | null;
  transcript: string | null;
  recording_url: string | null;
  created_at: string;
}

export interface WebhookEvent {
  id: string;
  retell_call_id: string;
  event_type: "call_started" | "call_ended" | "function_call";
  payload: Record<string, unknown>;
  processed: boolean;
  created_at: string;
}
