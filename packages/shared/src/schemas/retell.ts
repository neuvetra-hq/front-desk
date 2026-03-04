import { z } from "zod";

export const CheckAvailabilityPayload = z.object({
  date: z.string(),
  service_type: z.string().optional(),
});

export const BookAppointmentPayload = z.object({
  customer_name: z.string(),
  customer_phone: z.string(),
  customer_email: z.string(),
  datetime: z.string(),
  service_type: z.string(),
  job_notes: z.string().optional(),
});

export const ScheduleCallbackPayload = z.object({
  customer_name: z.string(),
  customer_phone: z.string(),
  preferred_time: z.string().optional(),
  reason: z.string().optional(),
});

export const TransferCallPayload = z.object({
  reason: z.enum(["angry", "complex", "requested"]),
});

export const WebhookEventSchema = z.object({
  event_type: z.enum(["call_started", "call_ended", "function_call"]),
  call_id: z.string(),
  agent_id: z.string().optional(),
  call: z.record(z.string(), z.unknown()).optional(),
  func_call: z
    .object({
      func_call_id: z.string(),
      function_name: z.string(),
      parameters: z.record(z.string(), z.unknown()),
    })
    .optional(),
});

export type CheckAvailabilityPayload = z.infer<typeof CheckAvailabilityPayload>;
export type BookAppointmentPayload = z.infer<typeof BookAppointmentPayload>;
export type ScheduleCallbackPayload = z.infer<typeof ScheduleCallbackPayload>;
export type TransferCallPayload = z.infer<typeof TransferCallPayload>;
/** Incoming Retell webhook payload (parsed + validated by WebhookEventSchema) */
export type RetellWebhookEvent = z.infer<typeof WebhookEventSchema>;
