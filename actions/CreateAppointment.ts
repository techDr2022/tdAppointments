import prisma from "@/lib/db";

// Define the types for the function parameters
interface CreateAppointmentParams {
  date: string;
  location?: string; // Should be a valid date string (e.g., '2024-12-04T10:00:00')
  doctorId: number;
  patientId: number;
  serviceId?: number; // Optional, because a service might not be provided
  timeslotId: number;
}

export async function CreateAppointment({
  date,
  location,
  doctorId,
  patientId,
  serviceId,
  timeslotId,
}: CreateAppointmentParams) {
  try {
    // Validate required fields
    if (!date || !doctorId || !patientId || !timeslotId) {
      throw new Error(
        "Missing required fields: date, doctorId, patientId, and timeslotId are required."
      );
    }

    // Convert the date string to a Date object
    const appointmentDate = new Date(date);

    // Check if the doctor and patient exist
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!doctor) {
      throw new Error("Doctor not found.");
    }

    if (!patient) {
      throw new Error("Patient not found.");
    }

    // Check if the timeslot is available (optional step, if you want to ensure that the timeslot is free)
    const timeslot = await prisma.timeslot.findUnique({
      where: { id: timeslotId },
    });

    if (!timeslot) {
      throw new Error("Timeslot not found.");
    }

    if (!timeslot.isAvailable) {
      throw new Error("The selected timeslot is not available.");
    }

    // Create the appointment
    const newAppointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        doctorId,
        location,
        patientId,
        serviceId,
        timeslotId,
        status: "PENDING", // Default status
      },
    });

    // Return the created appointment
    return newAppointment;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating appointment:", error.message);
      throw new Error(`Error creating appointment: ${error.message}`);
    } else {
      console.error("An unknown error occurred");
      throw new Error("An unknown error occurred");
    }
  }
}

export async function findAppointmentById(appointmentId: number) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId, // The ID of the appointment you want to find
      },
    });

    if (!appointment) {
      console.log("Appointment not found");
      return null;
    }

    return appointment;
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return null;
  }
}
