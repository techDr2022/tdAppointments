import prisma from "@/lib/db";
import { appointmentDetails } from "../SendMessage";
import { CreateTimeSlot } from "../CreateTimeslot";
import { cancelAppointmentJobs } from "../CronExecution";
import { formatDateTime } from "./formatDateTime";

export async function handleRescheduleAppointment({
  appointmentId,
  selectedDate,
  selectedTime,
}: {
  appointmentId: number;
  selectedDate: Date;
  selectedTime: string;
}) {
  // Validate input
  if (!appointmentId || !selectedDate || !selectedTime) {
    throw new Error("Missing required input parameters.");
  }

  // Get appointment details
  const Details = await appointmentDetails(appointmentId);
  if (!Details) {
    throw new Error(`Invalid appointmentId: ${appointmentId}`);
  }

  // Process date with Indian timezone
  const appointmentDate = new Date(selectedDate);
  const indianTimeOffset = 5.5 * 60 * 60 * 1000; // IST in milliseconds
  const normalizedDate = new Date(appointmentDate.getTime() + indianTimeOffset);
  const dateKey = normalizedDate.toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  if (!Details?.doctor?.id) {
    throw new Error("Doctor ID is missing in appointment details.");
  }

  // Create time slot
  let updatetimeSlot;
  try {
    updatetimeSlot = await CreateTimeSlot({
      date: dateKey,
      time: selectedTime,
      doctorid: Details.doctor.id,
      type: "FORM",
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Failed to create a time slot. " + error.message);
    }
    throw error;
  }

  if (!updatetimeSlot) {
    throw new Error("Unable to create a valid time slot.");
  }

  const newDate = new Date(dateKey);

  // Update appointment
  try {
    await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        date: newDate,
        status: "RESCHEDULED",
        timeslotId: updatetimeSlot.id,
      },
    });
    await cancelAppointmentJobs(Details.id);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Failed to update appointment. " + error.message);
    }
    throw error;
  }

  // Update timeslot
  try {
    await prisma.timeslot.update({
      where: {
        id: updatetimeSlot.id,
      },
      data: {
        isAvailable: false,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        "Failed to update timeslot availability. " + error.message
      );
    }
    throw error;
  }

  // Format date and time
  const { formattedDate, formattedTime } = formatDateTime(
    updatetimeSlot.startTime
  );

  return {
    details: Details,
    formattedDate,
    formattedTime,
    timeslot: updatetimeSlot,
  };
}
