"use server";
import twilio from "twilio";
import prisma from "@/lib/db";

import { appointmentDetails, AppointmentDetailsType } from "./SendMessage";
import { cancelAppointmentJobs, cronJobAction } from "./CronExecution";
import { CreateTimeSlot } from "./CreateTimeslot";
import { ResendEmail, sendMailBmt } from "./SendMailBmt";
import { Resend } from "resend";
import ConfirmationTemplate from "@/components/EmailTemplates/ConfirmMailTemplate";
import CancellationEmail from "@/components/EmailTemplates/CancelMailTemplate";
import FeedbackEmail from "@/components/EmailTemplates/FeedbackTemplate";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.WHATSAPP_FROM;

const resend = new Resend(process.env.RESEND_API_KEY);

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
    console.log(Details);
    console.log("Service found:", service);

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
    await Promise.all([
      client.messages.create({
        from: `whatsapp:${whatsappFrom}`,
        to: `whatsapp:${doctor.whatsapp}`,
        contentSid: "HX5d0a05c6723a9cda245d1788e0c0c4de",
        contentVariables: JSON.stringify(doctorMessageVariables),
      }),
      client.messages.create({
        from: `whatsapp:${whatsappFrom}`,
        to: `whatsapp:+91${patient.phone}`,
        contentSid: "HXa1672e45e06f45afd0111d23ae7ac1a7",
        contentVariables: JSON.stringify(patientMessageVariables),
      }),
    ]);

    const EmailResult = await sendMailBmt({
      patientName: patient.name,
      patientContact: patient.phone,
      age: patient.age ?? "Not specified",
      service: service.name,
      date: date[0],
      time: formattedTime,
      location: Details.location ?? "Not specified",
      appointmentId: Details.id,
      patientMail: patient.email,
    });
    if (EmailResult.success) {
      return true;
    } else {
      return false;
    }
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
    if (timeslot.isAvailable !== false) {
      const date = timeslot.startTime.toISOString().split("T");
      const trimmedTime = date[1].slice(0, 5);
      const [hours, minutes] = trimmedTime.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12; // Convert 0 to 12 for midnight
      const formattedTime = `${formattedHours}:${minutes
        .toString()
        .padStart(2, "0")} ${period}`;
      const Maplocation =
        Details.location == "Kukatpally"
          ? "https://maps.app.goo.gl/h7vdSbEByxfi5Pth7"
          : "https://maps.app.goo.gl/Y2CKWH6jds7EyRVg6";

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
        6: Maplocation,
      };

      // Send confirmation message
      await client.messages.create({
        from: `whatsapp:${whatsappFrom}`,
        to: `whatsapp:+91${patient.phone}`,
        contentSid: "HXfcdbf92e0aa07ed89b98a8d18b72e1f3",
        contentVariables: JSON.stringify(messageVariables),
      });

      const ConfirmationProps = {
        PatientName: patient.name,
        Date: date[0],
        Time: formattedTime,
        Service: service.name,
        PatientContact: patient.phone,
        Location: Details.location ?? "Not Specified",
        GoogleMapsLink: Maplocation,
      };

      if (patient.email) {
        const { error } = await resend.emails.send({
          from: `${ResendEmail}`,
          to: [patient.email],
          subject: "Your Appointment is Confirmed",
          react: ConfirmationTemplate(ConfirmationProps),
        });
        if (error) {
          console.log(error);
          return false;
        }
      }

      // Atomic transaction for updates
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

      await cronJobAction(Details);

      return true;
    }
    return false;
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

    const CancellationProps = {
      PatientName: patient.name,
      Date: date[0],
      Time: formattedTime,
    };

    if (patient.email) {
      const { error } = await resend.emails.send({
        from: `${ResendEmail}`,
        to: [patient.email],
        subject: "Your Appointment is Cancelled",
        react: CancellationEmail(CancellationProps),
      });
      if (error) {
        console.log(error);
        return false;
      }
    }

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
    const FeedbackEmailProps = {
      PatientName: Details.patient.name,
      GoogleReviewLink: "https://g.page/r/CR9s-awhOM_NEBM/review",
    };
    if (Details.patient.email) {
      const { error } = await resend.emails.send({
        from: `${ResendEmail}`,
        to: [Details.patient.email],
        subject: "Feedback",
        react: FeedbackEmail(FeedbackEmailProps),
      });
      if (error) {
        console.log(error);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function sendReminderMessageBMT(Details: AppointmentDetailsType) {
  try {
    const { patient, timeslot, service } = Details;
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

    if (Details.doctor.id === 28) {
      const messageVariables = {
        1: patient.name,
        2: date[0],
        3: formattedTime,
        4: Details.location,
      };
      await client.messages.create({
        from: `whatsapp:${whatsappFrom}`,
        to: `whatsapp:+91${Details.patient.phone}`,
        contentSid: `${Details.doctor.sid_Rm}`,
        contentVariables: JSON.stringify(messageVariables),
      });
    } else {
      const messageVariables = {
        1: patient.name,
        2: service?.name,
        3: date[0],
        4: formattedTime,
        5: Details.location,
      };
      await client.messages.create({
        from: `whatsapp:${whatsappFrom}`,
        to: `whatsapp:+91${Details.patient.phone}`,
        contentSid: "HXfc6792ecdb6eb6f72a76c4c2aee5b1a6",
        contentVariables: JSON.stringify(messageVariables),
      });
    }

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function SendRescheduleMessageBMT({
  appointmentId,
  selectedDate,
  selectedTime,
}: {
  appointmentId: number;
  selectedDate: Date;
  selectedTime: string;
}) {
  try {
    if (!appointmentId || !selectedDate || !selectedTime) {
      throw new Error("Missing required input parameters.");
    }

    const Details = await appointmentDetails(appointmentId);
    if (!Details) {
      throw new Error(`Invalid appointmentId: ${appointmentId}`);
    }

    console.log("Selected Date:", selectedDate);

    const appointmentDate = new Date(selectedDate);
    const indianTimeOffset = 5.5 * 60 * 60 * 1000; // IST in milliseconds
    const normalizedDate = new Date(
      appointmentDate.getTime() + indianTimeOffset
    );

    const dateKey = normalizedDate.toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });

    const Maplocation =
      Details.location === "Kukatpally"
        ? "https://maps.app.goo.gl/h7vdSbEByxfi5Pth7"
        : "https://maps.app.goo.gl/Y2CKWH6jds7EyRVg6";

    if (!Details?.doctor?.id) {
      throw new Error("Doctor ID is missing in appointment details.");
    }

    let updatetimeSlot;
    try {
      updatetimeSlot = await CreateTimeSlot({
        date: dateKey,
        time: selectedTime,
        doctorid: Details.doctor.id,
        type: "FORM",
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Failed to create a time slot. " + error.message);
      }
      throw error; // Re-throw non-Error types
    }

    if (!updatetimeSlot) {
      throw new Error("Unable to create a valid time slot.");
    }

    const newDate = new Date(dateKey);

    try {
      await prisma.appointment.update({
        where: {
          id: appointmentId,
        },
        data: {
          date: newDate,
          status: "RESCHEDULED",
          timeslotId: updatetimeSlot.id,
        },
      });
      const cancelAppointJobs = await cancelAppointmentJobs(Details.id);
      console.log("cancelledAppointJobs", cancelAppointJobs.message);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Failed to update appointment. " + error.message);
      }
      throw error;
    }

    try {
      await prisma.timeslot.update({
        where: {
          id: updatetimeSlot.id,
        },
        data: {
          isAvailable: false,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          "Failed to update timeslot availability. " + error.message
        );
      }
      throw error;
    }

    const date = updatetimeSlot.startTime.toISOString().split("T");
    const trimmedTime = date[1].slice(0, 5);
    const [hours, minutes] = trimmedTime.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedTime = `${formattedHours}:${minutes
      .toString()
      .padStart(2, "0")} ${period}`;

    const messageVariables = {
      1: Details.patient.name,
      2: Details.patient.name,
      3: Details.location,
      4: Details.service?.name,
      5: date[0],
      6: formattedTime,
      7: Maplocation,
    };

    try {
      await client.messages.create({
        from: `whatsapp:${whatsappFrom}`,
        to: `whatsapp:+91${Details.patient.phone}`,
        contentSid: "HX38e75743e1684186053a0bded13b6f7b",
        contentVariables: JSON.stringify(messageVariables),
      });

      await cronJobAction(Details);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Failed to send WhatsApp message. " + error.message);
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in SendRescheduleMessageBMT:", error.message);
      return error.message;
    } else {
      console.error("Unexpected error in SendRescheduleMessageBMT:", error);
      return "An unexpected error occurred.";
    }
  }
}

export async function SendRescheduleMessageRagas({
  appointmentId,
  selectedDate,
  selectedTime,
}: {
  appointmentId: number;
  selectedDate: Date;
  selectedTime: string;
}) {
  try {
    if (!appointmentId || !selectedDate || !selectedTime) {
      throw new Error("Missing required input parameters.");
    }

    const Details = await appointmentDetails(appointmentId);
    if (!Details) {
      throw new Error(`Invalid appointmentId: ${appointmentId}`);
    }

    console.log("Selected Date:", selectedDate);

    const appointmentDate = new Date(selectedDate);
    const indianTimeOffset = 5.5 * 60 * 60 * 1000; // IST in milliseconds
    const normalizedDate = new Date(
      appointmentDate.getTime() + indianTimeOffset
    );

    const dateKey = normalizedDate.toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });

    if (!Details?.doctor?.id) {
      throw new Error("Doctor ID is missing in appointment details.");
    }

    let updatetimeSlot;
    try {
      updatetimeSlot = await CreateTimeSlot({
        date: dateKey,
        time: selectedTime,
        doctorid: Details.doctor.id,
        type: "FORM",
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Failed to create a time slot. " + error.message);
      }
      throw error; // Re-throw non-Error types
    }

    if (!updatetimeSlot) {
      throw new Error("Unable to create a valid time slot.");
    }

    const newDate = new Date(dateKey);

    try {
      await prisma.appointment.update({
        where: {
          id: appointmentId,
        },
        data: {
          date: newDate,
          status: "RESCHEDULED",
          timeslotId: updatetimeSlot.id,
        },
      });
      const cancelAppointJobs = await cancelAppointmentJobs(Details.id);
      console.log("cancelledAppointJobs", cancelAppointJobs.message);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Failed to update appointment. " + error.message);
      }
      throw error;
    }

    try {
      await prisma.timeslot.update({
        where: {
          id: updatetimeSlot.id,
        },
        data: {
          isAvailable: false,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          "Failed to update timeslot availability. " + error.message
        );
      }
      throw error;
    }

    const date = updatetimeSlot.startTime.toISOString().split("T");
    const trimmedTime = date[1].slice(0, 5);
    const [hours, minutes] = trimmedTime.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedTime = `${formattedHours}:${minutes
      .toString()
      .padStart(2, "0")} ${period}`;

    const messageVariables = {
      1: Details.patient.name,
      2: Details.doctor.name,
      3: Details.patient.name,
      4: date[0],
      5: formattedTime,
    };

    console.log("Message Variables:", messageVariables);

    try {
      await client.messages.create({
        from: `whatsapp:${whatsappFrom}`,
        to: `whatsapp:+91${Details.patient.phone}`,
        contentSid: "HX4600f15430f24a4e3810291c8b4d38a0",
        contentVariables: JSON.stringify(messageVariables),
      });

      await cronJobAction(Details);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Failed to send WhatsApp message. " + error.message);
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in SendRescheduleRagaMessage:", error.stack);
      return true;
    } else {
      console.error("Unexpected error in SendRescheduleMessageBMT:", error);
      return "An unexpected error occurred.";
    }
  }
}
