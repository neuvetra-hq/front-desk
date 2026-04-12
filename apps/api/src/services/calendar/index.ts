// ---------------------------------------------------------------------------
// CalendarService — provider router
// Routes to the correct adapter based on the connection's provider field.
// Adding a new provider = add enum value + new adapter file. Zero other changes.
//
// Calendar is the single source of truth.
// Ownership of appointments is verified here before any mutation.
// ---------------------------------------------------------------------------

import { db, calendarConnections, businesses } from "@frontdesk/database"
import { eq, and } from "drizzle-orm"
import { GoogleCalendarAdapter } from "./google"
import { OutlookCalendarAdapter } from "./outlook"
import type {
  CalendarAdapter,
  CalendarProvider,
  CalendarConnection,
  CheckAvailabilityParams,
  BookAppointmentParams,
  BookingResult,
  TimeSlot,
  AppointmentRecord,
} from "./types"

export type { CalendarProvider, CalendarConnection, TimeSlot, BookingResult, AppointmentRecord }

// ---------------------------------------------------------------------------
// Business hours validation
// ---------------------------------------------------------------------------

interface DayHours { open: boolean; from: string; to: string }
type BusinessHoursMap = Record<string, DayHours>

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

/**
 * Throws a descriptive error if startTime + durationMinutes falls outside
 * the business's configured hours. If no hours are configured, passes through.
 *
 * This is enforced for every booking and reschedule — not just in the webhook —
 * so no code path can bypass it.
 */
export async function assertWithinBusinessHours(
  businessId: string,
  startTime: string,
  durationMinutes: number,
): Promise<void> {
  const [business] = await db
    .select({ aiConfig: businesses.aiConfig })
    .from(businesses)
    .where(eq(businesses.id, businessId))
    .limit(1)

  if (!business) throw new Error("Business not found")

  const hoursMap = (business.aiConfig as { businessHours?: BusinessHoursMap } | null)
    ?.businessHours

  // No hours configured → no restriction
  if (!hoursMap) return

  const start   = new Date(startTime)
  const end     = new Date(start.getTime() + durationMinutes * 60 * 1000)
  const dayName = DAY_NAMES[start.getDay()]
  const day     = hoursMap[dayName]

  if (!day?.open) {
    throw new Error(`The business is closed on ${dayName}. Please choose a different day.`)
  }

  const [openH, openM]  = day.from.split(":").map(Number)
  const [closeH, closeM] = day.to.split(":").map(Number)
  const dayOpen  = new Date(start.getFullYear(), start.getMonth(), start.getDate(), openH,  openM,  0)
  const dayClose = new Date(start.getFullYear(), start.getMonth(), start.getDate(), closeH, closeM, 0)

  if (start < dayOpen || end > dayClose) {
    throw new Error(
      `The requested time is outside business hours (${day.from}–${day.to} on ${dayName}).`,
    )
  }
}

function getAdapter(provider: CalendarProvider): CalendarAdapter {
  switch (provider) {
    case "google":  return GoogleCalendarAdapter
    case "outlook": return OutlookCalendarAdapter
    default:
      throw new Error(`No adapter for calendar provider: ${provider}`)
  }
}

export async function getActiveConnection(businessId: string): Promise<CalendarConnection | null> {
  const [row] = await db
    .select()
    .from(calendarConnections)
    .where(
      and(
        eq(calendarConnections.businessId, businessId),
        eq(calendarConnections.isActive, true),
      ),
    )
    .limit(1)

  if (!row) return null

  return {
    id:                row.id,
    businessId:        row.businessId,
    provider:          row.provider as CalendarProvider,
    providerAccountId: row.providerAccountId,
    providerEmail:     row.providerEmail,
    accessToken:       row.accessToken,
    refreshToken:      row.refreshToken,
    tokenExpiry:       row.tokenExpiry,
    isActive:          row.isActive,
  }
}

export async function checkAvailability(
  businessId: string,
  params: Omit<CheckAvailabilityParams, "connection">,
): Promise<TimeSlot[]> {
  const connection = await getActiveConnection(businessId)
  if (!connection) throw new Error("No calendar connected for this business")

  const adapter = getAdapter(connection.provider)
  return adapter.checkAvailability({ ...params, connection })
}

export async function bookAppointment(
  businessId: string,
  params: Omit<BookAppointmentParams, "connection">,
): Promise<BookingResult> {
  await assertWithinBusinessHours(businessId, params.startTime, params.durationMinutes)

  const connection = await getActiveConnection(businessId)
  if (!connection) throw new Error("No calendar connected for this business")

  const adapter = getAdapter(connection.provider)
  return adapter.bookAppointment({ ...params, connection })
}

// ---------------------------------------------------------------------------
// Appointment management — calendar is the source of truth for all of these.
// ---------------------------------------------------------------------------

/**
 * Find all upcoming appointments for a customer phone number across the
 * connected calendar. Uses provider-native metadata queries (no DB scan).
 */
export async function findAppointmentsByPhone(
  businessId: string,
  customerPhone: string,
): Promise<AppointmentRecord[]> {
  const connection = await getActiveConnection(businessId)
  if (!connection) throw new Error("No calendar connected for this business")

  const adapter = getAdapter(connection.provider)
  return adapter.findByCustomerPhone(connection, customerPhone)
}

/**
 * Cancel an appointment — verifies the event belongs to the caller's phone
 * before deleting. The eventId comes from a prior findAppointmentsByPhone call
 * (held in the AI's conversation context, never spoken aloud by the caller).
 */
export async function cancelAppointment(
  businessId: string,
  customerPhone: string,
  eventId: string,
): Promise<void> {
  const connection = await getActiveConnection(businessId)
  if (!connection) throw new Error("No calendar connected for this business")

  const adapter = getAdapter(connection.provider)

  // Ownership check: re-query by phone and confirm this eventId is in the results
  const appointments = await adapter.findByCustomerPhone(connection, customerPhone)
  const match = appointments.find((a) => a.eventId === eventId)
  if (!match) throw new Error("No appointment found for this caller with that ID")

  await adapter.cancelEvent(connection, eventId)
}

/**
 * Reschedule an appointment to a new time.
 * Verifies ownership via phone, then checks the new slot is free before patching.
 */
export async function rescheduleAppointment(
  businessId: string,
  customerPhone: string,
  eventId: string,
  newStartTime: string,
  durationMinutes: number,
): Promise<AppointmentRecord> {
  const connection = await getActiveConnection(businessId)
  if (!connection) throw new Error("No calendar connected for this business")

  const adapter = getAdapter(connection.provider)

  // Ownership check
  const appointments = await adapter.findByCustomerPhone(connection, customerPhone)
  const match = appointments.find((a) => a.eventId === eventId)
  if (!match) throw new Error("No appointment found for this caller with that ID")

  // Business hours check on the new slot
  await assertWithinBusinessHours(businessId, newStartTime, durationMinutes)

  // Availability check on the new slot
  const newEnd = new Date(new Date(newStartTime).getTime() + durationMinutes * 60 * 1000)
  const freeSlots = await adapter.checkAvailability({
    connection,
    from:            newStartTime,
    to:              newEnd.toISOString(),
    durationMinutes,
  })
  if (freeSlots.length === 0) {
    throw new Error("The requested new time slot is not available")
  }

  await adapter.updateEvent(connection, eventId, { startTime: newStartTime, durationMinutes })

  return {
    ...match,
    startTime: newStartTime,
    endTime:   newEnd.toISOString(),
  }
}
