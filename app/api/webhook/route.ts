import { NextResponse } from "next/server";
import { Webhook } from "@/actions/SendMessage";

export async function POST(request: Request) {
  try {
    // For Twilio webhook, use request.formData() instead of request.json()
    const formData = await request.formData();

    // Convert FormData to a plain object
    const data: { [key: string]: string } = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    // Optional: Validate Twilio signature if needed (using Twilio's package)

    // Call your webhook handler
    await Webhook(data);

    // Return only a 200 status
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Error processing Twilio webhook:", error);
    return new NextResponse(null, { status: 500 });
  }
}
