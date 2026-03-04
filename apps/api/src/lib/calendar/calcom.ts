import type {
  BookAppointmentPayload,
  CheckAvailabilityPayload,
} from "@front-desk/shared";
import type {
  AvailabilitySlot,
  BookedAppointment,
  CalendarAdapter,
} from "./index.js";

export class CalComAdapter implements CalendarAdapter {
  async checkAvailability(
    _payload: CheckAvailabilityPayload,
  ): Promise<AvailabilitySlot[]> {
    // TODO: implement Cal.com availability lookup
    return [];
  }

  async bookAppointment(
    payload: BookAppointmentPayload,
  ): Promise<BookedAppointment> {
    // TODO: implement Cal.com booking
    return {
      calendar_event_id: "stub-calcom-event-id",
      scheduled_at: payload.datetime,
    };
  }
}
