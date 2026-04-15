// Outlook / Microsoft Graph CalendarAdapter — stub, ready for implementation
// Same interface as google.ts — swap in CalendarService when needed.
//
// Implementation notes for when this gets built:
//   findByCustomerPhone — use open extensions + $filter:
//     GET /me/events?$filter=extensions/any(f:f/id eq 'com.frontdesk.appointment'
//       and f/frontdesk_customer_phone eq '+1...')
//   cancelEvent  — DELETE /me/events/:id
//   updateEvent  — PATCH /me/events/:id { start, end }
//   bookAppointment — POST /me/events, add open extension with phone/email/name

import type { CalendarAdapter } from "./types"

export const OutlookCalendarAdapter: CalendarAdapter = {
  async refreshIfNeeded(_connection) {
    throw new Error("Outlook calendar adapter not yet implemented")
  },
  async checkAvailability(_params) {
    throw new Error("Outlook calendar adapter not yet implemented")
  },
  async bookAppointment(_params) {
    throw new Error("Outlook calendar adapter not yet implemented")
  },
  async findByCustomerPhone(_connection, _phone) {
    throw new Error("Outlook calendar adapter not yet implemented")
  },
  async cancelEvent(_connection, _eventId) {
    throw new Error("Outlook calendar adapter not yet implemented")
  },
  async updateEvent(_connection, _eventId, _params) {
    throw new Error("Outlook calendar adapter not yet implemented")
  },
  async getUpcomingEvents(_connection, _from, _to) {
    throw new Error("Outlook calendar adapter not yet implemented")
  },
}
