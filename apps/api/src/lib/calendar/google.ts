import type {
  BookAppointmentPayload,
  CheckAvailabilityPayload,
} from "@front-desk/shared";
import type {
  AvailabilitySlot,
  BookedAppointment,
  CalendarAdapter,
} from "./index.js";

export class GoogleCalendarAdapter implements CalendarAdapter {
  async checkAvailability(
    _payload: CheckAvailabilityPayload,
  ): Promise<AvailabilitySlot[]> {
    // TODO: implement Google Calendar free/busy lookup
    return [];
  }

  async bookAppointment(
    payload: BookAppointmentPayload,
  ): Promise<BookedAppointment> {
    // TODO: implement Google Calendar event creation
    return {
      calendar_event_id: "stub-google-event-id",
      scheduled_at: payload.datetime,
    };
  }
}
