"use server";
import prisma from "@/lib/db";
import { Appointment } from "@/types/model";

// Define the types for the function parameters
interface CreateAppointmentParams {
  date: string;
  location?: string; // Should be a valid date string (e.g., '2024-12-04T10:00:00')
  doctorId: number;
  patientId: number;
  serviceId?: number; // Optional, because a service might not be provided
  timeslotId: number;
  reason?: string;
  type: "MANUAL" | "FORM";
}

export async function CreateAppointment({
  date,
  location,
  doctorId,
  serviceId,
  patientId,
  timeslotId,
  reason,
  type,
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

    if (!timeslot.isAvailable && type === "FORM") {
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
        reason: reason || null,
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

export async function findAppointmentById(id: number) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: {
          include: {
            services: {
              include: {
                doctor: true,
                appointments: true,
              },
            },
            timeslots: true,
            appointments: true,
            ehrRecords: true,
          },
        },
        patient: true,
        timeslot: true,
        service: true,
      },
    });
    if (!appointment) return null;
    return appointment as Appointment;
  } catch (err) {
    console.error(err);
    return null;
  }
}
