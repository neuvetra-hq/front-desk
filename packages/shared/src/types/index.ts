// ============================================================================
// Front Desk — Shared Types
// @front-desk/shared
//
// RULES:
//   - Types and interfaces ONLY. No functions, no classes, no runtime code.
//   - No imports from external packages with side effects.
//   - All apps (web, mobile, api) import from "@front-desk/shared".
// ============================================================================

// ----------------------------------------------------------------------------
// Core domain
// ----------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  organizationId: string;
  role: UserRole;
  createdAt: string;
}

export type UserRole = "admin" | "agent" | "viewer";

export interface Organization {
  id: string;
  name: string;
  plan: BillingPlan;
  createdAt: string;
}

export type BillingPlan = "starter" | "pro" | "enterprise";

// ----------------------------------------------------------------------------
// Retell AI (stub — no logic)
// ----------------------------------------------------------------------------

export interface RetellWebhookPayload {
  callId: string;
  agentId: string;
  event: RetellWebhookEvent;
  timestamp: number;
  /** Caller phone number in E.164 format */
  fromNumber: string;
  /** Recipient phone number in E.164 format */
  toNumber: string;
}

export type RetellWebhookEvent =
  | "call_started"
  | "call_ended"
  | "call_analyzed";

// ----------------------------------------------------------------------------
// API response envelope
// ----------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
}

// ----------------------------------------------------------------------------
// Appointments (stub)
// ----------------------------------------------------------------------------

export interface Appointment {
  id: string;
  organizationId: string;
  title: string;
  startAt: string; // ISO 8601
  endAt: string;   // ISO 8601
  status: AppointmentStatus;
}

export type AppointmentStatus = "scheduled" | "completed" | "cancelled";
