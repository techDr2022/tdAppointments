"use server";
import prisma from "@/lib/db";

// Define the appointment status type
export type AppointmentStatus = "CONFIRMED" | "CANCELLED" | "RESCHEDULED";

// Define the types for the related data
export interface AppointmentDetails {
  id: number;
  name: string;
  phoneNumber: string;
  location: string | null; // Updated to allow null
  date: string;
  doctor: string;
  time: string;
  treatment: string;
  status: AppointmentStatus;
}

export interface AppointmentResponse {
  website: string;
  appointments: AppointmentDetails[];
}

export const getDoctorAppointments = async (
  doctorId: number
): Promise<AppointmentResponse> => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
      },
      include: {
        doctor: true,
        patient: true,
        service: true,
        timeslot: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    const website = appointments[0]?.doctor.website || "";
    const formattedAppointments: AppointmentDetails[] = appointments.map(
      (appointment) => {
        const startTime = new Date(appointment.timeslot.startTime);

        // Adjust for timezone (UTC +5:30)
        const adjustedTime = new Date(
          startTime.getTime() - 5.5 * 60 * 60 * 1000
        );

        const formattedDate = startTime.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        const formattedTime = adjustedTime.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        return {
          id: appointment.id,
          name: appointment.patient.name,
          phoneNumber: appointment.patient.phone,
          location: appointment.location, // Now matches the nullable type
          date: formattedDate,
          doctor: appointment.doctor.name,
          time: formattedTime,
          treatment: appointment.service?.name || "N/A",
          status: appointment.status as AppointmentStatus,
        };
      }
    );

    return {
      website,
      appointments: formattedAppointments,
    };
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    throw new Error("Failed to retrieve appointments. Please try again.");
  }
};
