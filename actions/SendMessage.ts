"use server";
import twilio from "twilio";
import { z } from "zod"; // Recommended for input validation
import prisma from "@/lib/db";
import { findAppointmentById } from "./CreateAppointment";

// Validate environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.WHATSAPP_FROM;

if (!accountSid || !authToken || !whatsappFrom) {
  throw new Error("Missing required environment variables");
}

const client = twilio(accountSid, authToken);

// Webhook data validation schema
const WebhookDataSchema = z.object({
  Body: z.enum(["CONFIRM", "CANCEL", "Cancel appointment"]), // Allows "CONFIRM", "CANCEL", or "Cancel appointment"
  ButtonPayload: z.string(),
});

import { Appointment } from "../types/model";
import {
  SendCancelMessageBMT,
  SendConfirmMessageBMT,
  SendMessageBMT,
} from "./SendMessageBmt";
import { cancelAppointmentJobs, cronJobAction } from "./CronExecution";

export type AppointmentDetailsType = {
  doctor: {
    id: number;
    name: string;
    website: string;
    timings: Record<string, string[]>; // Accepts both type1 and type2
    whatsapp: string | null;
    sid_doctor?: string | null;
    sid_Ack?: string | null;
    sid_Pcf?: string | null;
    sid_Pcn?: string | null;
    sid_Rm?: string | null;
    sid_Fd?: string | null;
    sid_resch?: string | null;
    image_slug?: string | null; // Image slug for doctor's profile picture
    feedback_link?: string | null; // Link for patient feedback/reviews
    map_location?: string | null; // Google Maps or location link
  };
  patient: {
    id: number;
    name: string;
    age: string;
    phone: string;
    email: string | null;
    sex: string | null;
    relationship: string | null; // Added relationship field
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
  reason?: string | null;
  appointmentType?: string | null; // initial, followup, secondopinion, others
  customAppointmentType?: string | null; // Custom type when "others" is selected
  bookingType?: string | null; // myself, others
  relationship?: string | null; // Relationship when booking for others
};

export async function appointmentDetails(
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
    if (!appointment) {
      console.log(`No appointment found with ID: ${id}`);
      return null;
    }

    // Ensure doctor object exists
    if (!appointment.doctor) {
      console.error(`Doctor information missing for appointment ID: ${id}`);
      return null;
    }

    // Return with safely cast timings, providing empty object as default when timings is null/undefined
    return {
      ...appointment,
      doctor: {
        ...appointment.doctor,
        timings: appointment.doctor.timings
          ? (appointment.doctor.timings as Record<string, string[]>)
          : ({} as Record<string, string[]>),
      },
    };
  } catch (err) {
    console.error(`Error retrieving appointment details for ID ${id}:`, err);
    return null;
  }
}

export async function FormatedTimeDate(startTime: Date) {
  const date = startTime.toISOString().split("T");
  const trimmedTime = date[1].slice(0, 5);
  const [hours, minutes] = trimmedTime.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for midnight
  const formattedTime = `${formattedHours}:${minutes
    .toString()
    .padStart(2, "0")} ${period}`;

  return { formattedDate: date[0], formattedTime };
}

export async function sendMessage_acknow_confirm(
  Details: AppointmentDetailsType
) {
  try {
    const { doctor, patient, timeslot } = Details;
    console.log("Fetched entities:", {
      doctorFound: !!doctor,
      patientFound: !!patient,
      timeSlotFound: !!timeslot,
    });

    if (!doctor || !patient || !timeslot) {
      console.error("Missing required appointment details");
      return false;
    }

    const resultTimeDate = await FormatedTimeDate(timeslot.startTime);
    const formatedDate = resultTimeDate.formattedDate;
    const formattedTime = resultTimeDate.formattedTime;
    console.log("Preparing message variables:", {
      doctorWhatsapp: doctor.whatsapp,
      patientPhone: patient.phone,
      serviceDate: formatedDate,
      serviceTime: formattedTime,
    });

    // Messages for doctor
    const appointmentIdString = Details.id.toString();

    if (
      doctor.id == 20 ||
      doctor.id == 27 ||
      doctor.id == 46 ||
      doctor.id == 35
    ) {
      const doctorMessageVariables = {
        1: doctor.name,
        2: patient.name,
        3: patient.age,
        4: `${formatedDate}`,
        5: `${formattedTime}`,
        6: patient.phone,
        7: Details.reason || "N/A",
        8: appointmentIdString,
        9: appointmentIdString,
        10: Details.doctor.name,
        11: appointmentIdString,
      };

      // Messages for patient
      const patientMessageVariables = {
        1: patient.name,
        2: patient.name,
        3: `${formatedDate}`,
        4: `${formattedTime}`,
        5: doctor.name,
        6: Details.reason || "N/A",
      };

      // Format doctor WhatsApp number properly for specific doctors
      const doctorWhatsApp = doctor.whatsapp?.startsWith("+")
        ? doctor.whatsapp
        : doctor.whatsapp?.startsWith("91")
          ? `+${doctor.whatsapp}`
          : `+91${doctor.whatsapp}`;

      console.log(
        "Doctor WhatsApp (formatted for specific doctors):",
        doctorWhatsApp
      );

      await Promise.all([
        client.messages.create({
          from: `whatsapp:${whatsappFrom}`,
          to: `whatsapp:${doctorWhatsApp}`,
          contentSid: `${doctor.sid_doctor}`,
          contentVariables: JSON.stringify(doctorMessageVariables),
        }),
        client.messages.create({
          from: `whatsapp:${whatsappFrom}`,
          to: `whatsapp:+91${patient.phone}`,
          contentSid: `${doctor.sid_Ack}`,
          contentVariables: JSON.stringify(patientMessageVariables),
        }),
      ]);

      return true;
    } else if (doctor.id == 28) {
      const doctorMessageVariables = {
        1: patient.name,
        2: patient.age,
        3: Details.location || "N/A",
        4: `${formatedDate} and ${formattedTime}`,
        5: patient.phone,
        6: appointmentIdString,
        7: appointmentIdString,
      };

      // Messages for patient
      const patientMessageVariables = {
        1: patient.name,
        2: patient.name,
        3: `${formatedDate}`,
        4: `${formattedTime}`,
        5: Details.location || "N/A",
      };

      // Format doctor WhatsApp number properly for doctor ID 28
      const doctorWhatsApp28 = doctor.whatsapp?.startsWith("+")
        ? doctor.whatsapp
        : doctor.whatsapp?.startsWith("91")
          ? `+${doctor.whatsapp}`
          : `+91${doctor.whatsapp}`;

      console.log(
        "Doctor WhatsApp (formatted for doctor 28):",
        doctorWhatsApp28
      );

      await Promise.all([
        client.messages.create({
          from: `whatsapp:${whatsappFrom}`,
          to: `whatsapp:${doctorWhatsApp28}`,
          contentSid: `${doctor.sid_doctor}`,
          contentVariables: JSON.stringify(doctorMessageVariables),
        }),
        client.messages.create({
          from: `whatsapp:${whatsappFrom}`,
          to: `whatsapp:+91${patient.phone}`,
          contentSid: `${doctor.sid_Ack}`,
          contentVariables: JSON.stringify(patientMessageVariables),
        }),
      ]);
      return true;
    } else {
      const doctorMessageVariables = {
        1: doctor.name,
        2: patient.name,
        3: patient.age || "N/A",
        4: patient.sex || "N/A",
        5: `${formatedDate}`,
        6: `${formattedTime}`,
        7: patient.phone,
        8: Details.bookingType == "others" ? Details.relationship : "myself",
        9:
          Details.appointmentType == "others"
            ? Details.customAppointmentType
            : Details.appointmentType || "N/A",
        10: Details.doctor.image_slug || "N/A",
        11: appointmentIdString,
        12: appointmentIdString,
        13: appointmentIdString,
      };

      // Messages for patient
      const patientMessageVariables = {
        1: patient.name,
        2: Details.doctor.name,
        3: patient.name,
        4: Details.patient.age || "N/A",
        5: Details.patient.sex || "N/A",
        6: `${formatedDate}`,
        7: `${formattedTime}`,
        8: Details.doctor.image_slug || "N/A",
      };

      console.log("doctorMessageVariables", doctorMessageVariables);
      console.log("patientMessageVariables", patientMessageVariables);

      // Debug logging for WhatsApp numbers
      console.log("Doctor WhatsApp (raw):", doctor.whatsapp);
      console.log("Patient phone (raw):", patient.phone);

      // Validate doctor WhatsApp number exists
      if (!doctor.whatsapp) {
        console.error("Doctor WhatsApp number is missing or null");
        throw new Error(
          `Doctor WhatsApp number is missing for doctor ID: ${doctor.id}`
        );
      }

      // Format doctor WhatsApp number properly
      const doctorWhatsApp = doctor.whatsapp.startsWith("+")
        ? doctor.whatsapp
        : doctor.whatsapp.startsWith("91")
          ? `+${doctor.whatsapp}`
          : `+91${doctor.whatsapp}`;

      console.log("Doctor WhatsApp (formatted):", doctorWhatsApp);
      console.log("Patient WhatsApp (formatted):", `+91${patient.phone}`);

      try {
        const [doctorMessageResult, patientMessageResult] = await Promise.all([
          client.messages.create({
            from: `whatsapp:${whatsappFrom}`,
            to: `whatsapp:${doctorWhatsApp}`,
            contentSid: "HXe23d709fc9fd60f79752a36a7acf9d00",
            contentVariables: JSON.stringify(doctorMessageVariables),
          }),
          client.messages.create({
            from: `whatsapp:${whatsappFrom}`,
            to: `whatsapp:+91${patient.phone}`,
            contentSid: "HX837b8cda88e86a652e04bc08cab17ff6",
            contentVariables: JSON.stringify(patientMessageVariables),
          }),
        ]);

        console.log("Doctor message sent successfully:", doctorMessageResult);
        console.log("Patient message sent successfully:", patientMessageResult);
      } catch (messageError) {
        console.error("Error sending messages:", messageError);
        throw messageError;
      }

      return true;
    }

    // Send messages in parallel
  } catch (err) {
    console.error(err);
    return false;
  }
}
export async function sendMessage(appointment: Appointment) {
  try {
    console.log(`Sending message for appointment ID: ${appointment.id}`);
    const Details = await appointmentDetails(appointment.id);
    console.log("Details", Details);

    if (Details) {
      if (appointment.doctorId == 1) {
        const result = SendMessageBMT(Details);
        return result;
      } else {
        console.log("Details", Details);
        const result = await sendMessage_acknow_confirm(Details);
        return result;
      }
    }
    return false;
  } catch (err) {
    console.error("Error in sendMessage:", err);
    return false;
  }
}

export async function SendConfirmMessageAll(Details: AppointmentDetailsType) {
  try {
    const { doctor, patient, timeslot } = Details;
    if (!doctor || !patient || !timeslot) {
      console.error("Missing required appointment details for confirmation", {
        doctorFound: !!doctor,
        patientFound: !!patient,
        timeSlotFound: !!timeslot,
      });
      return false;
    }

    // Get the timeslot with its type
    const timeSlotWithType = await prisma.timeslot.findUnique({
      where: { id: timeslot.id },
      select: { type: true },
    });

    const resultTimeDate = await FormatedTimeDate(timeslot.startTime);
    const formatedDate = resultTimeDate.formattedDate;
    const formattedTime = resultTimeDate.formattedTime;

    console.log("Confirmation message details:", {
      patientName: patient.name,
      appointmentDate: formatedDate,
      appointmentTime: formattedTime,
      location: Details.location,
    });

    let messageVariables = {};

    if (
      doctor.id == 20 ||
      doctor.id == 27 ||
      doctor.id == 46 ||
      doctor.id == 35
    ) {
      messageVariables = {
        1: patient.name,
        2: `${formatedDate}`,
        3: `${formattedTime}`,
        4: Details.doctor.name,
        5: Details.reason || "N/A",
      };
    } else if (doctor.id == 28) {
      let mapLink;
      if (Details.location == "Zenith ENT and SKIN Clinic") {
        mapLink = "https://maps.app.goo.gl/MbfPQJXzmt7Y6qJSA";
      } else if (Details.location == "MERAKI ENT INTERNATIONAL HOSPITAL") {
        mapLink = "https://maps.app.goo.gl/qN9F6TzcMRFb3oho8";
      } else {
        mapLink = "https://maps.app.goo.gl/Vm8NDnu4zKj8uqbt6";
      }
      messageVariables = {
        1: patient.name,
        2: Details.location || "N/A",
        3: `${formatedDate}`,
        4: `${formattedTime}`,
        6: mapLink,
      };
    } else {
      messageVariables = {
        1: patient.name,
        2: Details.doctor.name,
        3: patient.name,
        4: `${formatedDate}`,
        5: `${formattedTime}`,
        6: Details.doctor.map_location || "N/A",
        7: Details.doctor.website,
        8: Details.doctor.whatsapp,
        9: Details.doctor.image_slug || "N/A",
      };
    }

    // Send confirmation message
    console.log("timeSlotWithType", timeSlotWithType?.type);
    if (
      (doctor.id === 20 ||
        doctor.id === 27 ||
        doctor.id === 46 ||
        doctor.id === 35) &&
      timeSlotWithType?.type === "MANUAL"
    ) {
      console.log("entered");
      messageVariables = {
        1: patient.name,
        2: `${formatedDate}`,
        3: `${formattedTime}`,
        4: Details.doctor.name,
      };
      const manualConfirmResult = await client.messages.create({
        from: `whatsapp:${whatsappFrom}`,
        to: `whatsapp:+91${patient.phone}`,
        contentSid: "HX96e17d4ab1a20f14826f09883e8a7520",
        contentVariables: JSON.stringify(messageVariables),
        statusCallback: `${process.env.BASE_URL}/api/delivery-webhook`,
      });

      // Log the manual confirmation message
      await prisma.messageLog.create({
        data: {
          messageSid: manualConfirmResult.sid,
          appointmentId: Details.id,
          patientId: patient.id,
          messageType: "confirmation",
          status: "queued",
        },
      });
    } else {
      //single location
      const messageResult = await client.messages.create({
        from: `whatsapp:${whatsappFrom}`,
        to: `whatsapp:+91${patient.phone}`,
        contentSid: "HX6b5f279ff7bd065b59c53d8f11f2a45e",
        contentVariables: JSON.stringify(messageVariables),
        statusCallback: `${process.env.BASE_URL}/api/delivery-webhook`,
      });

      await prisma.messageLog.create({
        data: {
          messageSid: messageResult.sid,
          appointmentId: Details.id,
          patientId: patient.id,
          messageType: "confirmation",
          status: "queued",
        },
      });
    }

    // Atomic transaction with conditional timeslot update
    if (timeSlotWithType?.type === "FORM") {
      await prisma.$transaction([
        prisma.timeslot.update({
          where: { id: timeslot.id },
          data: { isAvailable: false },
        }),
        prisma.appointment.update({
          where: { id: Details.id },
          data: { status: "CONFIRMED" },
        }),
      ]);
    } else {
      // Only update appointment status for MANUAL type
      await prisma.appointment.update({
        where: { id: Details.id },
        data: { status: "CONFIRMED" },
      });
    }

    await cronJobAction(Details);

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function sendConfirmMessage(appointment: Appointment) {
  try {
    console.log(
      `Attempting to send confirmation for appointment ID: ${appointment.id}`
    );
    const Details = await appointmentDetails(appointment.id);

    if (Details) {
      if (Details.doctor.id == 1) {
        const result = await SendConfirmMessageBMT(Details);
        return result;
      } else {
        const result = await SendConfirmMessageAll(Details);
        return result;
      }
    }
    return false;
  } catch (error) {
    console.error("Error sending confirmation message:", error);
    return false;
  }
}

export async function SendCancelMessageAll(Details: AppointmentDetailsType) {
  try {
    const { patient, timeslot, doctor } = Details;
    if (!patient || !timeslot || !doctor) {
      console.error("Missing required appointment details for cancellation", {
        patientFound: !!patient,
        timeSlotFound: !!timeslot,
        doctorFound: !!doctor,
      });
      return false;
    }
    const resultTimeDate = await FormatedTimeDate(timeslot.startTime);
    const formatedDate = resultTimeDate.formattedDate;
    const formattedTime = resultTimeDate.formattedTime;

    console.log("Cancellation message details:", {
      patientName: patient.name,
      appointmentDate: formatedDate,
      appointmentTime: formattedTime,
    });

    const messageVariables = {
      1: patient.name,
      2: formatedDate,
      3: formattedTime,
      4: Details.doctor.whatsapp,
      5: Details.doctor.name,
      6: Details.doctor.image_slug || "N/A",
    };

    // Send cancellation message
    const cancelMessageResult = await client.messages.create({
      from: `whatsapp:${whatsappFrom}`,
      to: `whatsapp:+91${patient.phone}`,
      contentSid: "HXa919af358c8510333f7dc9d6d71890b8",
      contentVariables: JSON.stringify(messageVariables),
      statusCallback: `${process.env.BASE_URL}/api/delivery-webhook`,
    });

    console.log("Cancellation message send result:", cancelMessageResult);

    // Log the cancellation message
    await prisma.messageLog.create({
      data: {
        messageSid: cancelMessageResult.sid,
        appointmentId: Details.id,
        patientId: patient.id,
        messageType: "cancellation",
        status: "queued",
      },
    });

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
        isAvailable: true,
      },
    });

    const cancelAppointJobs = await cancelAppointmentJobs(Details.id);
    console.log("cancelled jobs", cancelAppointJobs.message);
    console.log("Appointment status update result:", updateResult);
    console.log("timeSlot update", UpdateTimeSlot);
    return true;
  } catch (err) {
    console.error(err);
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
      } else {
        const result = await SendCancelMessageAll(Details);
        return result;
      }
    } else {
      return false;
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
      console.log("Invalid webhook data");
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

      case "Cancel appointment":
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
