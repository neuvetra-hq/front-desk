import type { CalendarProvider } from "@front-desk/shared";
import type { CalendarAdapter } from "./index.js";
import { GoogleCalendarAdapter } from "./google.js";
import { CalComAdapter } from "./calcom.js";

export function getCalendarAdapter(provider: CalendarProvider): CalendarAdapter {
  switch (provider) {
    case "google":
      return new GoogleCalendarAdapter();
    case "calcom":
      return new CalComAdapter();
  }
}
