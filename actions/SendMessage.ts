"use server";
// import twilio from "twilio";
import { z } from "zod"; // Recommended for input validation
import { findAppointmentById } from "./CreateAppointment";
import prisma from "@/lib/db";

// Validate environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.WHATSAPP_FROM;

if (!accountSid || !authToken || !whatsappFrom) {
  throw new Error("Missing required environment variables");
}

// const client = twilio(accountSid, authToken);

// Webhook data validation schema
const WebhookDataSchema = z.object({
  Body: z.enum(["CONFIRM", "CANCEL"]), // Allows only "CONFIRM" or "CANCEL"
  ButtonPayload: z.string(),
});

import { Appointment } from "../types/model";
import {
  SendCancelMessageBMT,
  SendConfirmMessageBMT,
  SendMessageBMT,
} from "./SendMessageBmt";

export type AppointmentDetailsType = {
  doctor: {
    id: number;
    name: string;
    website: string;
    whatsapp: string | null;
  };
  patient: {
    id: number;
    name: string;
    age: string;
    phone: string;
  };
  service: {
    id: number;
    name: string;
  } | null;
  timeslot: {
    id: number;
    startTime: Date;
    isAvailable: boolean;
  };
  id: number;
  date: Date;
  status: string;
  location?: string | null;
};

async function appointmentDetails(
  id: number
): Promise<AppointmentDetailsType | null> {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: true,
        service: true,
        patient: true,
        timeslot: true,
      },
    });

    // Type guard to ensure the appointment exists
    if (!appointment) return null;
    return appointment;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function sendMessage(appointment: Appointment) {
  try {
    console.log(`Sending message for appointment ID: ${appointment.id}`);
    const Details = await appointmentDetails(appointment.id);

    if (Details) {
      if (appointment.doctorId == 1) {
        const result = SendMessageBMT(Details);
        return result;
      }
    }
  } catch (err) {
    console.error("Error in sendMessage:", err);
    return false;
  }
}

async function sendConfirmMessage(appointment: Appointment) {
  try {
    console.log(
      `Attempting to send confirmation for appointment ID: ${appointment.id}`
    );
    const Details = await appointmentDetails(appointment.id);

    if (Details) {
      if (Details.doctor.id == 1) {
        const result = await SendConfirmMessageBMT(Details);
        return result;
      }
    }
  } catch (error) {
    console.error("Error sending confirmation message:", error);
    return false;
  }
}

async function sendCancelMessage(appointment: Appointment) {
  try {
    console.log(
      `Attempting to send cancellation for appointment ID: ${appointment.id}`
    );

    const Details = await appointmentDetails(appointment.id);
    if (Details) {
      if (Details.doctor.id == 1) {
        const result = await SendCancelMessageBMT(Details);
        return result;
      }
    }
  } catch (error) {
    console.error("Error sending cancellation message:", error);
    return false;
  }
}

export async function Webhook(data: unknown) {
  try {
    console.log("Webhook received. Processing data...");

    // Validate input using Zod
    const validatedData = WebhookDataSchema.safeParse(data);

    if (!validatedData.success) {
      console.error("Invalid webhook data", validatedData.error);
      return false;
    }

    const { Body: responseText } = validatedData.data;
    const appointmentId = parseInt(validatedData.data.ButtonPayload || "0", 10);

    console.log("Webhook details:", {
      responseText,
      appointmentId,
    });

    if (!appointmentId) {
      console.error("Invalid appointment ID");
      return false;
    }

    const appointment = await findAppointmentById(appointmentId);

    if (!appointment) {
      console.error(`Appointment not found: ${appointmentId}`);
      return false;
    }

    console.log("Appointment found. Processing response...");

    switch (responseText) {
      case "CONFIRM":
        console.log("Processing confirmation for appointment");
        return await sendConfirmMessage(appointment);
      case "CANCEL":
        console.log("Processing cancellation for appointment");
        return await sendCancelMessage(appointment);
      default:
        console.error(`Unexpected response: ${responseText}`);
        return false;
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    return false;
  }
}
