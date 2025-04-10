"use server";

import { BMTAppointmentFormData } from "@/components/Hematologybmt";
import { CreateAppointment, findAppointmentById } from "./CreateAppointment";
import { CreateTimeSlot } from "./CreateTimeslot";
import { createPatient, findPatientByPhone } from "./patient";
import { findDoctorById } from "./Doctor";
import { sendConfirmMessage, sendMessage } from "./SendMessage";
import { AllAppointmentFormData } from "@/components/DrForms";
import prisma from "@/lib/db";
import { DrArunaEntFormProps } from "@/components/DrArunaEntForm";
import { DoctorType } from "@/types/model";

export async function SubmitHandlerBMT(data: BMTAppointmentFormData) {
  try {
    // Validate the input
    if (!data.date || !data.time || !data.whatsapp) {
      throw new Error(
        "Missing required fields: date, time, or WhatsApp number."
      );
    }
    console.log("date", data.date);
    console.log("time", data.time);
    // Fetch the doctor
    const doctor = await findDoctorById(1);
    if (!doctor) {
      throw new Error("Doctor not found.");
    }

    // Normalize and format the date
    const appointmentDate = new Date(data.date);
    // Adjust for Indian timezone (UTC+5:30)
    const indianTimeOffset = 5.5 * 60 * 60 * 1000; // IST in milliseconds
    const normalizedDate = new Date(
      appointmentDate.getTime() + indianTimeOffset
    );

    // Get the normalized date in Indian timezone
    const dateKey = normalizedDate.toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });

    console.log("dataKey", dateKey);
    console.log("data.date", data.date);
    console.log("data.email", data.email);
    // Find or create the patient
    let patient = await findPatientByPhone(data.whatsapp);

    if (patient) {
      if (
        patient.name !== data.name ||
        patient.age !== data.age ||
        patient.email !== data.email
      ) {
        const UpdatePatient = await prisma.patient.update({
          where: {
            phone: patient.phone,
          },
          data: {
            name: data.name,
            age: data.age,
            email: data.email,
          },
        });
        patient = UpdatePatient;
      }
    }
    if (!patient) {
      patient = await createPatient({
        name: data.name,
        age: data.age,
        phone: data.whatsapp,
        email: data.email,
      });
    }

    // Find the selected service
    const service = doctor?.services?.find((s) => s.name === data.service);
    console.log("service", service);
    if (!service) {
      throw new Error("Selected service not found for the doctor.");
    }

    // Create a timeslot
    const timeSlot = await CreateTimeSlot({
      type: "FORM",
      date: dateKey,
      time: data.time,
      doctorid: doctor.id,
    });
    if (!timeSlot) {
      throw new Error("Failed to create a time slot.");
    }

    // Create the appointment
    const appointment = await CreateAppointment({
      type: "FORM",
      date: dateKey,
      location: data.location,
      timeslotId: timeSlot.id,
      serviceId: service.id,
      doctorId: doctor.id,
      patientId: patient.id,
    });

    console.log("appointment", appointment);
    if (!appointment) {
      throw new Error("Failed to create the appointment.");
    }

    // Get the complete appointment with relations
    const completeAppointment = await findAppointmentById(appointment.id);

    if (!completeAppointment) {
      throw new Error("Failed to retrieve the complete appointment.");
    }

    // Send a message confirmation
    const messageResult = await sendMessage(completeAppointment);
    if (!messageResult) {
      throw new Error("Failed to send the message.");
    }

    return { success: true };
  } catch (error) {
    console.error("Error in SubmitHandlerBMT:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred.",
    };
  }
}

export async function SubmitHandlerArunaEnt(data: DrArunaEntFormProps) {
  try {
    // Validate the input
    if (!data.date || !data.time || !data.whatsapp) {
      throw new Error(
        "Missing required fields: date, time, or WhatsApp number."
      );
    }
    console.log("date", data.date);
    console.log("time", data.time);
    // Fetch the doctor
    const doctor = await findDoctorById(28);
    if (!doctor) {
      throw new Error("Doctor not found.");
    }

    // Normalize and format the date
    const appointmentDate = new Date(data.date);
    // Adjust for Indian timezone (UTC+5:30)
    const indianTimeOffset = 5.5 * 60 * 60 * 1000; // IST in milliseconds
    const normalizedDate = new Date(
      appointmentDate.getTime() + indianTimeOffset
    );

    // Get the normalized date in Indian timezone
    const dateKey = normalizedDate.toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });

    console.log("dataKey", dateKey);
    console.log("data.date", data.date);
    // Find or create the patient
    let patient = await findPatientByPhone(data.whatsapp);

    if (patient) {
      if (patient.name !== data.name || patient.age !== data.age) {
        const UpdatePatient = await prisma.patient.update({
          where: {
            phone: patient.phone,
          },
          data: {
            name: data.name,
            age: data.age,
          },
        });
        patient = UpdatePatient;
      }
    }
    if (!patient) {
      patient = await createPatient({
        name: data.name,
        age: data.age,
        phone: data.whatsapp,
        email: null,
      });
    }

    // Create a timeslot
    const timeSlot = await CreateTimeSlot({
      type: "FORM",
      date: dateKey,
      time: data.time,
      doctorid: doctor.id,
    });
    if (!timeSlot) {
      throw new Error("Failed to create a time slot.");
    }

    // Create the appointment
    const appointment = await CreateAppointment({
      type: "FORM",
      date: dateKey,
      location: data.location,
      timeslotId: timeSlot.id,
      doctorId: doctor.id,
      patientId: patient.id,
    });

    console.log("appointment", appointment);
    if (!appointment) {
      throw new Error("Failed to create the appointment.");
    }

    // Get the complete appointment with relations
    const completeAppointment = await findAppointmentById(appointment.id);

    if (!completeAppointment) {
      throw new Error("Failed to retrieve the complete appointment.");
    }

    // Send a message confirmation
    const messageResult = await sendMessage(completeAppointment);
    if (!messageResult) {
      throw new Error("Failed to send the message.");
    }

    return { success: true };
  } catch (error) {
    console.error("Error in SubmitHandlerBMT:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred.",
    };
  }
}

export async function SubmitHandlerAll(
  data: AllAppointmentFormData,
  type: "MANUAL" | "FORM",
  doctorId: number
) {
  try {
    if (!data.date || !data.time || !data.whatsapp) {
      throw new Error(
        "Missing required fields: date, time, or WhatsApp number."
      );
    }

    console.log("data", data);

    const appointmentDate = new Date(data.date);
    let dateKey: string;

    if (type === "FORM") {
      // Add IST offset only for form submissions
      const indianTimeOffset = 5.5 * 60 * 60 * 1000;
      const normalizedDate = new Date(
        appointmentDate.getTime() + indianTimeOffset
      );
      dateKey = normalizedDate.toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });
    } else {
      // For manual entries, use the date as is
      dateKey = appointmentDate.toLocaleDateString("en-CA");
    }

    console.log("dataKey", dateKey);
    console.log("data.date", data.date);
    console.log("doctorId", doctorId);
    const patient = await createPatient({
      name: data.name,
      age: data.age,
      phone: data.whatsapp,
      email: null,
    });
    const doctor = await findDoctorById(doctorId);
    if (!doctor) {
      throw new Error("Doctor not found.");
    }

    const timeSlot = await CreateTimeSlot({
      type,
      date: dateKey,
      time: data.time,
      doctorid: doctor.id,
    });

    console.log("TimeSlot:", timeSlot);

    const appointment = await CreateAppointment({
      type,
      date: dateKey,
      timeslotId: timeSlot.id,
      doctorId: doctor.id,
      reason: data.reason,
      patientId: patient.id,
    });

    // Get the complete appointment with relations
    const completeAppointment = await findAppointmentById(appointment.id);

    if (!completeAppointment) {
      throw new Error("Failed to retrieve the complete appointment.");
    }

    // Send a message confirmation
    if (type === "FORM") {
      const messageResult = await sendMessage(completeAppointment);
      if (!messageResult) {
        throw new Error("Failed to send the message.");
      }

      return { success: true };
    } else {
      const confirmResult = await sendConfirmMessage(completeAppointment);
      if (!confirmResult) {
        throw new Error("Failed to send the confirmation message.");
      }
      return { success: true };
    }
    return { success: true };
  } catch (error) {
    console.error("Error in SubmitHandlerBMT:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred.",
    };
  }
}
