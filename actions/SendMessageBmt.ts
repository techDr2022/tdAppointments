"use server";
import twilio from "twilio";
import prisma from "@/lib/db";

import { AppointmentDetailsType } from "./SendMessage";
import { cronJobAction } from "./CronExecution";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.WHATSAPP_FROM;

if (!accountSid || !authToken || !whatsappFrom) {
  throw new Error("Missing required environment variables");
}

const client = twilio(accountSid, authToken);

export async function SendMessageBMT(Details: AppointmentDetailsType) {
  try {
    const { doctor, patient, timeslot, service } = Details;
    console.log("Fetched entities:", {
      doctorFound: !!doctor,
      patientFound: !!patient,
      timeSlotFound: !!timeslot,
    });

    if (!doctor || !patient || !timeslot) {
      console.error("Missing required appointment details");
      return false;
    }

    if (!service) {
      console.error("Service not found");
      return false;
    }

    const date = timeslot.startTime.toISOString().split("T");
    const trimmedTime = date[1].slice(0, 5);
    const [hours, minutes] = trimmedTime.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for midnight
    const formattedTime = `${formattedHours}:${minutes
      .toString()
      .padStart(2, "0")} ${period}`;

    console.log("Preparing message variables:", {
      doctorWhatsapp: doctor.whatsapp,
      patientPhone: patient.phone,
      serviceDate: date[0],
      serviceTime: formattedTime,
    });

    // Messages for doctor
    const appointmentIdString = Details.id.toString();
    const doctorMessageVariables = {
      1: patient.name,
      2: service.name,
      3: `${date[0]} and ${formattedTime}`,
      4: patient.phone,
      5: appointmentIdString,
      6: appointmentIdString,
      7: Details.location ?? "Not specified",
      8: patient.age ?? "Not specified",
    };

    // Messages for patient
    const patientMessageVariables = {
      1: patient.name,
      2: patient.name,
      3: service.name,
      4: date[0],
      5: formattedTime,
      6: Details.location ?? "Not specified",
    };

    // Send messages in parallel
    const messageSendResult = await Promise.all([
      client.messages.create({
        from: `whatsapp:${whatsappFrom}`,
        to: `whatsapp:${doctor.whatsapp}`,
        contentSid: "HX5d0a05c6723a9cda245d1788e0c0c4de",
        contentVariables: JSON.stringify(doctorMessageVariables),
      }),
      client.messages.create({
        from: `whatsapp:${whatsappFrom}`,
        to: `whatsapp:+91${patient.phone}`,
        contentSid: "HX71642e50cdecf6414b9f022d9171028b",
        contentVariables: JSON.stringify(patientMessageVariables),
      }),
    ]);

    console.log("Message send results:", messageSendResult);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function SendConfirmMessageBMT(Details: AppointmentDetailsType) {
  try {
    const { doctor, patient, timeslot, service } = Details;
    if (!doctor || !patient || !timeslot || !service) {
      console.error("Missing required appointment details for confirmation", {
        doctorFound: !!doctor,
        patientFound: !!patient,
        timeSlotFound: !!timeslot,
        serviceFound: !!service,
      });
      return false;
    }

    const date = timeslot.startTime.toISOString().split("T");
    const trimmedTime = date[1].slice(0, 5);
    const [hours, minutes] = trimmedTime.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for midnight
    const formattedTime = `${formattedHours}:${minutes
      .toString()
      .padStart(2, "0")} ${period}`;

    console.log("Confirmation message details:", {
      patientName: patient.name,
      serviceName: service.name,
      appointmentDate: date[0],
      appointmentTime: trimmedTime,
      location: Details.location,
    });

    const messageVariables = {
      1: patient.name,
      2: service.name,
      3: date[0],
      4: formattedTime,
      5: Details.location ?? "Not specified",
    };

    // Send confirmation message
    const confirmMessageResult = await client.messages.create({
      from: `whatsapp:${whatsappFrom}`,
      to: `whatsapp:+91${patient.phone}`,
      contentSid: "HX2a65ac11807b442006bca2465875e179",
      contentVariables: JSON.stringify(messageVariables),
    });

    console.log("Confirmation message send result:", confirmMessageResult);

    // Atomic transaction for updates
    const transactionResult = await prisma.$transaction([
      prisma.timeslot.update({
        where: { id: timeslot.id },
        data: { isAvailable: false },
      }),
      prisma.appointment.update({
        where: { id: Details.id },
        data: { status: "CONFIRMED" },
      }),
    ]);
    console.log("Transaction update results:", transactionResult);

    await cronJobAction(Details);

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function SendCancelMessageBMT(Details: AppointmentDetailsType) {
  try {
    const { patient, timeslot, service } = Details;
    if (!patient || !timeslot || !service) {
      console.error("Missing required appointment details for cancellation", {
        patientFound: !!patient,
        timeSlotFound: !!timeslot,
        serviceFound: !!service,
      });
      return false;
    }

    const date = timeslot.startTime.toISOString().split("T");
    const trimmedTime = date[1].slice(0, 5);
    const [hours, minutes] = trimmedTime.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for midnight
    const formattedTime = `${formattedHours}:${minutes
      .toString()
      .padStart(2, "0")} ${period}`;

    console.log("Cancellation message details:", {
      patientName: patient.name,
      appointmentDate: date[0],
      appointmentTime: formattedTime,
    });

    const messageVariables = {
      1: patient.name,
      2: date[0],
      3: formattedTime,
    };

    // Send cancellation message
    const cancelMessageResult = await client.messages.create({
      from: `whatsapp:${whatsappFrom}`,
      to: `whatsapp:+91${patient.phone}`,
      contentSid: "HX0d0c28a7db25d26cf018dead1e37d4c5",
      contentVariables: JSON.stringify(messageVariables),
    });

    console.log("Cancellation message send result:", cancelMessageResult);

    // Update appointment status
    const updateResult = await prisma.appointment.update({
      where: { id: Details.id },
      data: { status: "CANCELLED" },
    });

    const UpdateTimeSlot = await prisma.timeslot.update({
      where: {
        id: timeslot.id,
      },
      data: {
        isAvailable: false,
      },
    });
    console.log("Appointment status update result:", updateResult);
    console.log("timeSlot update", UpdateTimeSlot);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function sendFeedbackMessageBMT(Details: AppointmentDetailsType) {
  try {
    const messageVariables = {
      1: Details.patient.name,
    };
    await client.messages.create({
      from: `whatsapp:${whatsappFrom}`,
      to: `whatsapp:+91${Details.patient.phone}`,
      contentSid: "HX1a9f43d13f53970c0ecee149a9e40d52",
      contentVariables: JSON.stringify(messageVariables),
    });

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}
