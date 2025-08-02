import { NextResponse } from "next/server";
import twilio from "twilio";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.WHATSAPP_FROM;
const client = twilio(accountSid, authToken);

// Type for messageRecord with all included relations
type MessageRecordWithRelations = Prisma.MessageLogGetPayload<{
  include: {
    appointment: {
      include: {
        patient: true;
        doctor: true;
        timeslot: true;
      };
    };
  };
}>;

// app/api/delivery-webhook/route.ts
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data: { [key: string]: string } = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log("data", data);

    const { MessageSid: messageSid, MessageStatus: status } = data;

    console.log("Delivery status received:", { messageSid, status });

    // Find the message record using MessageSid
    const messageRecord = await prisma.messageLog.findUnique({
      where: { messageSid },
      include: {
        appointment: {
          include: {
            patient: true,
            doctor: true,
            timeslot: true,
          },
        },
      },
    });

    if (!messageRecord) {
      console.log("Message record not found for SID:", messageSid);
      return new NextResponse(null, { status: 200 });
    }

    // Update message status
    if (status != "sent") {
      await prisma.messageLog.update({
        where: { messageSid },
        data: {
          status,
          deliveredAt: status === "delivered" ? new Date() : undefined,
        },
      });
    }

    // Handle successful delivery - only send doctor notification once when delivered
    if (status === "delivered") {
      await handleSuccessfulDelivery(messageRecord);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Error processing delivery webhook:", error);
    return new NextResponse(null, { status: 500 });
  }
}

async function handleSuccessfulDelivery(
  messageRecord: MessageRecordWithRelations
) {
  const { appointment } = messageRecord;
  const { patient, doctor } = appointment;
  console.log("messageRecord", messageRecord);

  // Send confirmation to doctor
  if (doctor.whatsapp) {
    const MessageVariables = {
      1: messageRecord.messageType,
      2: patient.name, // confirmation/reminder/etc
    };

    await client.messages.create({
      from: `whatsapp:${whatsappFrom}`,
      to: `whatsapp:${doctor.whatsapp}`,
      contentSid: "HX1ff5cd15201ef3028815eb082ecd89ec",
      contentVariables: JSON.stringify(MessageVariables),
    });

    console.log(
      `✅ Delivery ${messageRecord.messageType} sent to  ${patient.name}`
    );
  }
}
