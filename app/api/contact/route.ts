import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { ContactForm } from "@/actions/ContactService";

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminPhone, form } = body;

    if (!adminPhone || !form) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let whatsappMessage;

    // Check if this is a reschedule request
    if (form.requestType === "RESCHEDULE") {
      // Send plain text message for reschedule requests
      const RescheduleMessageVariables = {
        1: form.businessName,
        2: form.contactPerson,
        3: form.phone,
        4: form.email,
        5: form.businessType,
        6: form.originalCallTime,
        7: form.preferredCallTime,
        8: form.requirements,
      };
      whatsappMessage = await client.messages.create({
        from: `whatsapp:${process.env.WHATSAPP_FROM}`,
        to: `whatsapp:${adminPhone}`,
        contentSid: "HX3f9a847c31c1a9a5f62930d8fd83871a",
        contentVariables: JSON.stringify(RescheduleMessageVariables),
      });
    } else {
      // Use template for new consultation requests
      const messageVariables = {
        1: form.businessName,
        2: form.contactPerson,
        3: form.phone,
        4: form.email,
        5: form.businessType,
        6: form.preferredCallTime,
        7: form.requirements,
      };

      whatsappMessage = await client.messages.create({
        from: `whatsapp:${process.env.WHATSAPP_FROM}`,
        to: `whatsapp:${adminPhone}`,
        contentSid: "HXbba91803bf6b9a26a16f69b416d7d835",
        contentVariables: JSON.stringify(messageVariables),
      });
    }

    console.log(whatsappMessage);

    return NextResponse.json({ success: true, messageId: whatsappMessage.sid });
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Failed to process contact form" },
      { status: 500 }
    );
  }
}

function formatRescheduleMessage(form: ContactForm): string {
  return `🔄 *RESCHEDULE REQUEST*

*Business Details*
📝 Name: ${form.businessName}
👤 Contact: ${form.contactPerson}
📱 Phone: ${form.phone}
📧 Email: ${form.email}
🏢 Type: ${form.businessType}

⏰ *Original Call Time:* ${form.originalCallTime || "Not specified"}
🔄 *New Preferred Time:* ${form.preferredCallTime}

*Requirements*
${form.requirements || "No specific requirements mentioned"}

---
Sent from TechDr Contact Form`;
}

function formatContactMessage(form: ContactForm): string {
  return `🆕 *New Business Inquiry*

*Business Details*
📝 Name: ${form.businessName}
👤 Contact: ${form.contactPerson}
📱 Phone: ${form.phone}
📧 Email: ${form.email}
🏢 Type: ${form.businessType}

⏰ Preferred Call Time: ${form.preferredCallTime || "Not specified"}

*Requirements*
${form.requirements || "No specific requirements mentioned"}

---
Sent from TechDr Contact Form`;
}
