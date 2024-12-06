import { NextResponse } from "next/server";
import { Webhook } from "@/actions/SendMessage";

export async function POST(request: Request) {
  try {
    // For Twilio webhook, use request.formData() instead of request.json()
    const formData = await request.formData();

    // Convert FormData to a plain object
    console.log("FormData", formData);
    const data: { [key: string]: string } = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    // Optional: Validate Twilio signature if you want to ensure the request is from Twilio
    // You'll need to install the twilio package and use twilio.validateRequest()

    // Call your webhook handler
    console.log("Received Twilio Data:", data);
    await Webhook(data);

    // Return a response (Twilio expects a 200 OK)
    return NextResponse.json(
      { message: "Message received successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing Twilio webhook:", error);
    return NextResponse.json(
      { message: "Error processing webhook" },
      { status: 500 }
    );
  }
}
