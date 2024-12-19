"use server";

import { BMTAppointmentFormData } from "@/components/Hematologybmt";
import { CreateAppointment } from "./CreateAppointment";
import { CreateTimeSlot } from "./CreateTimeslot";
import { createPatient, findPatientByPhone } from "./patient";
import { findDoctorById } from "./Doctor";
import { sendMessage } from "./SendMessage";
import { AllAppointmentFormData } from "@/components/DrAvaniReddy";

export async function SubmitHandlerBMT(data: BMTAppointmentFormData) {
  try {
    // Validate the input
    if (!data.date || !data.time || !data.whatsapp) {
      throw new Error(
        "Missing required fields: date, time, or WhatsApp number."
      );
    }

    // Fetch the doctor
    const doctor = await findDoctorById(1);
    if (!doctor) {
      throw new Error("Doctor not found.");
    }

    // Normalize and format the date
    const appointmentDate = new Date(data.date);
    const normalizedDate = new Date(
      appointmentDate.getFullYear(),
      appointmentDate.getMonth(),
      appointmentDate.getDate()
    );
    const dateKey = normalizedDate.toLocaleDateString("en-CA"); // YYYY-MM-DD format

    // Find or create the patient
    let patient = await findPatientByPhone(data.whatsapp);
    if (!patient) {
      patient = await createPatient({
        name: data.name,
        age: data.age,
        phone: data.whatsapp,
      });
    }

    // Find the selected service
    const service = doctor?.services?.find((s) => s.name === data.service);
    if (!service) {
      throw new Error("Selected service not found for the doctor.");
    }

    // Create a timeslot
    const timeSlot = await CreateTimeSlot({
      date: dateKey,
      time: data.time,
      doctorid: doctor.id,
    });
    if (!timeSlot) {
      throw new Error("Failed to create a time slot.");
    }

    // Create the appointment
    const appointment = await CreateAppointment({
      date: dateKey,
      location: data.location,
      timeslotId: timeSlot.id,
      serviceId: service.id,
      doctorId: doctor.id,
      patientId: patient.id,
    });
    if (!appointment) {
      throw new Error("Failed to create the appointment.");
    }

    // Send a message confirmation
    const messageResult = await sendMessage(appointment);
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
  doctorId: number
) {
  try {
    if (!data.date || !data.time || !data.whatsapp) {
      throw new Error(
        "Missing required fields: date, time, or WhatsApp number."
      );
    }

    const date = new Date(data.date);
    const normalizedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const dateKey = normalizedDate.toLocaleDateString("en-CA");

    console.log("dataKey", dateKey);
    console.log("data.date", data.date);
    const patient = await createPatient({
      name: data.name,
      age: data.age,
      phone: data.whatsapp,
    });
    const doctor = await findDoctorById(doctorId);
    if (!doctor) {
      throw new Error("Doctor not found.");
    }

    const timeSlot = await CreateTimeSlot({
      date: dateKey,
      time: data.time,
      doctorid: doctor.id,
    });

    console.log("TimeSlot:", timeSlot);

    const appointment = await CreateAppointment({
      date: dateKey,
      timeslotId: timeSlot.id,
      doctorId: doctor.id,
      patientId: patient.id,
    });

    // Send a message confirmation
    const messageResult = await sendMessage(appointment);
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
