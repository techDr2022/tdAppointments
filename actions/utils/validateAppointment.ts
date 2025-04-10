// New utility function for appointment validation
import { AppointmentDetailsType } from "../SendMessage";

export function validateAppointmentDetails(
  details: AppointmentDetailsType,
  requiredFields: Array<"doctor" | "patient" | "timeslot" | "service"> = [
    "doctor",
    "patient",
    "timeslot",
  ]
): boolean {
  const missingFields = requiredFields.filter((field) => !details[field]);

  if (missingFields.length > 0) {
    console.error(
      `Missing required appointment details: ${missingFields.join(", ")}`,
      {
        doctorFound: !!details.doctor,
        patientFound: !!details.patient,
        timeSlotFound: !!details.timeslot,
        serviceFound: !!details.service,
      }
    );
    return false;
  }

  return true;
}
