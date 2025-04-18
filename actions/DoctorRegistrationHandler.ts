"use server";

import prisma from "@/lib/db";

interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  countryCode: string;
}

export async function registerDoctor(data: RegistrationData) {
  try {
    // Validate required fields
    if (!data.fullName || !data.email || !data.password || !data.phoneNumber) {
      return {
        success: false,
        message: "All fields are required",
      };
    }

    // Check if email is already registered
    const existingDoctor = await prisma.doctor.findFirst({
      where: {
        OR: [
          { loginId: data.email }, // Check if email is used as loginId
          { whatsapp: data.countryCode + data.phoneNumber }, // Check if phone is already registered
        ],
      },
    });

    if (existingDoctor) {
      return {
        success: false,
        message: "Email or phone number is already registered",
      };
    }

    // Create new doctor
    const newDoctor = await prisma.doctor.create({
      data: {
        name: data.fullName,
        loginId: data.email,
        password: data.password, // In production, this should be hashed
        whatsapp: data.countryCode + data.phoneNumber,
        website: `${data.fullName.toLowerCase().replace(/\s+/g, "-")}.techdr.in`,
        type: "INDIVIDUAL",
      },
    });

    return {
      success: true,
      message: "Doctor registered successfully",
      doctorId: newDoctor.id,
    };
  } catch (error) {
    console.error("Error registering doctor:", error);
    return {
      success: false,
      message: "Failed to register doctor. Please try again.",
    };
  }
}

// Simulate OTP service (replace with actual SMS service in production)
export async function sendOTP(phoneNumber: string, countryCode: string) {
  try {
    // In a production environment, you would use a real SMS service
    // For now, we'll just simulate a successful OTP send

    console.log(`Sending OTP to ${countryCode}${phoneNumber}`);

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In production, store this OTP securely with the phone number and an expiration time
    // For this example, we'll just return it (would never do this in production)

    return {
      success: true,
      message: "OTP sent successfully",
      otp: otp, // Only for demo purposes!
    };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return {
      success: false,
      message: "Failed to send OTP. Please try again.",
    };
  }
}

// Verify OTP (for demo purposes only)
export async function verifyOTP(phoneNumber: string, otp: string) {
  try {
    // In a real app, you would check the OTP against the one stored for this phone number
    // This is just a placeholder that always returns true for demo

    // For demo: verify if OTP is 6 digits
    if (!/^\d{6}$/.test(otp)) {
      return {
        success: false,
        message: "Invalid OTP format",
      };
    }

    // Simulate successful verification
    return {
      success: true,
      message: "OTP verified successfully",
    };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return {
      success: false,
      message: "Failed to verify OTP. Please try again.",
    };
  }
}
