"use server";

import prisma from "@/lib/db";

// Define the appointment status type
export type AppointmentStatus =
  | "CONFIRMED"
  | "CANCELLED"
  | "RESCHEDULED"
  | "PENDING";

// Define the types for the related data
export interface AppointmentDetails {
  id: number;
  name: string;
  phoneNumber: string;
  location: string | null;
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
  id: number,
  type: "Individual" | "Clinic"
): Promise<AppointmentResponse> => {
  try {
    let appointments;

    if (type === "Clinic") {
      // For clinics, get appointments for all affiliated doctors
      const clinic = await prisma.clinic.findUnique({
        where: { id },
        include: {
          doctors: true,
        },
      });

      if (!clinic) {
        throw new Error("Clinic not found");
      }

      // Get appointments for all doctors in the clinic
      appointments = await prisma.appointment.findMany({
        where: {
          doctor: {
            clinicId: id,
            type: "CLINIC_AFFILIATED",
          },
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
    } else {
      // For individual doctors, get their appointments directly
      appointments = await prisma.appointment.findMany({
        where: {
          doctorId: id,
          doctor: {
            type: "INDIVIDUAL",
          },
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
    }

    // Get website from the first appointment's doctor or clinic
    let website = "";
    if (appointments.length > 0) {
      if (type === "Clinic") {
        const clinic = await prisma.clinic.findUnique({
          where: { id },
          select: { website: true },
        });
        website = clinic?.website || "";
      } else {
        website = appointments[0].doctor.website;
      }
    }

    const formattedAppointments: AppointmentDetails[] = appointments.map(
      (appointment) => {
        const startTime = new Date(appointment.timeslot.startTime);

        // Format date
        const formattedDate = startTime.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        // Format time
        const formattedTime = startTime.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        return {
          id: appointment.id,
          name: appointment.patient.name,
          phoneNumber: appointment.patient.phone,
          location: appointment.location,
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
    console.error("Error fetching appointments:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to retrieve appointments. Please try again."
    );
  }
};
