"use server";

import prisma from "@/lib/db"; // Import Prisma client

// Server action to find a patient by their phone number
export async function findPatientByPhone(phone: string) {
  try {
    if (!/^\d{10}$/.test(phone)) {
      throw new Error("Invalid phone number format");
    }

    const patient = await prisma.patient.findFirst({
      where: {
        phone: phone,
      },
    });

    if (!patient) {
      return null;
    }

    return patient; // Return the found patient
  } catch (error: unknown) {
    console.error("Error while finding patient:", { phone, error });

    if (error instanceof Error) {
      throw new Error(`Failed to find patient: ${error.message}`);
    } else {
      throw new Error("Failed to find patient: Unknown error");
    }
  }
}

export async function createPatient(data: {
  name: string;
  age: string;
  phone: string;
}) {
  try {
    if (!/^\d{10}$/.test(data.phone)) {
      throw new Error("Invalid phone number format");
    }

    if (isNaN(Number(data.age))) {
      throw new Error("Age must be a valid number");
    }

    const existingPatient = await prisma.patient.findFirst({
      where: {
        phone: data.phone,
      },
    });

    if (existingPatient) {
      return existingPatient;
    }

    const newPatient = await prisma.patient.create({
      data: {
        name: data.name,
        age: data.age,
        phone: data.phone,
      },
    });

    return newPatient;
  } catch (error: unknown) {
    console.error("Error while creating patient:", { data, error });

    if (error instanceof Error) {
      throw new Error(`Failed to create patient: ${error.message}`);
    } else {
      throw new Error("Failed to create patient: Unknown error");
    }
  }
}

export async function findPatientById(patientId: number) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return null;
    }

    return patient;
  } catch (error) {
    console.error("Error fetching patient:", error);
  }
}
