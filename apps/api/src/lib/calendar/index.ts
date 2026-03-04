import type { BookAppointmentPayload, CheckAvailabilityPayload } from "@front-desk/shared";

export interface AvailabilitySlot {
  start: string; // ISO 8601
  end: string;   // ISO 8601
}

export interface BookedAppointment {
  calendar_event_id: string;
  scheduled_at: string; // ISO 8601
}

export interface CalendarAdapter {
  checkAvailability(
    payload: CheckAvailabilityPayload,
  ): Promise<AvailabilitySlot[]>;

  bookAppointment(
    payload: BookAppointmentPayload,
  ): Promise<BookedAppointment>;
}
