import { NextResponse } from "next/server";

export type ContactForm = {
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  businessType: string;
  preferredCallTime: string;
  requirements: string;
};

export async function sendMessageContact(
  adminPhone: string,
  form: ContactForm
) {
  try {
    // Instead of using Twilio directly in the browser, we'll make an API call
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminPhone,
        form,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending contact message:", error);
    return { success: false, error };
  }
}
