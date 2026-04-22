import type { Session } from "@supabase/supabase-js"

export interface AppUserProfile {
  id: string
  firstName: string
  lastName: string
  phone: string
}

export interface AppBusiness {
  id: string
  name: string
  status: "active" | "inactive" | "suspended"
  businessType: string | null
  twilioNumber: string | null
  stripePlanId: string | null
  stripeSubscriptionId: string | null
  aiConfig: Record<string, unknown> | null
}

export interface AppContext {
  session: Session | null
  profile: AppUserProfile | null
  business: AppBusiness | null
  currentRoute: string
}

export type AppEvent =
  | { type: "AUTH_STATE_CHANGED"; session: Session | null }
  | { type: "SIGN_OUT" }
  | { type: "ROUTE_CHANGED"; pathname: string }
  | { type: "USER_INTERACTED" }
  | { type: "TOGGLE_MUTE" }
