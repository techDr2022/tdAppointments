"use server";
import twilio from "twilio";
import { AppointmentDetailsType } from "./SendMessage";

// Validate environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.WHATSAPP_FROM;

if (!accountSid || !authToken || !whatsappFrom) {
  throw new Error("Missing required environment variables");
}

const client = twilio(accountSid, authToken);

export async function sendFeedbackMessageAll(Details: AppointmentDetailsType) {
  try {
    const messageVariables = {
      1: Details.patient.name,
    };
    if(Details.doctor.sid_Fd){
    await client.messages.create({
      from: `whatsapp:${whatsappFrom}`,
      to: `whatsapp:+91${Details.patient.phone}`,
      contentSid: `${Details.doctor.sid_Fd}`,
      contentVariables: JSON.stringify(messageVariables),
    });
  }
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function sendReminderMessageAll(Details: AppointmentDetailsType) {
  try {
    const { patient, timeslot } = Details;
    const startTime = new Date(timeslot.startTime);

    if (isNaN(startTime.getTime())) {
      throw new Error("Invalid startTime: Unable to parse as a Date.");
    }
    const date = startTime.toISOString().split("T");
    const trimmedTime = date[1].slice(0, 5);
    const [hours, minutes] = trimmedTime.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for midnight
    const formattedTime = `${formattedHours}:${minutes
      .toString()
      .padStart(2, "0")} ${period}`;
    const messageVariables = {
      1: patient.name,
      2: date[0],
      3: formattedTime,
    };
    await client.messages.create({
      from: `whatsapp:${whatsappFrom}`,
      to: `whatsapp:+91${Details.patient.phone}`,
      contentSid: `${Details.doctor.sid_Rm}`,
      contentVariables: JSON.stringify(messageVariables),
    });

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}
