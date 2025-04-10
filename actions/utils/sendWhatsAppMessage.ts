// New utility function for sending WhatsApp messages
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.WHATSAPP_FROM;

if (!accountSid || !authToken || !whatsappFrom) {
  throw new Error("Missing required environment variables");
}

const client = twilio(accountSid, authToken);

// Using a more generic return type to avoid TypeScript errors
export async function sendWhatsAppMessage(
  to: string,
  contentSid: string,
  messageVariables: Record<string, string>
): Promise<unknown> {
  try {
    const formattedTo = to.startsWith("+") ? to : `+91${to}`;
    return await client.messages.create({
      from: `whatsapp:${whatsappFrom}`,
      to: `whatsapp:${formattedTo}`,
      contentSid,
      contentVariables: JSON.stringify(messageVariables),
    });
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
    throw error;
  }
}
