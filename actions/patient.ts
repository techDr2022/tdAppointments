import prisma from "@/lib/db"; // Import Prisma client

// Server action to find a patient by their phone number
export async function findPatientByPhone(phone: string) {
  try {
    // Only check if the phone is not empty
    if (!phone) {
      throw new Error("Phone number cannot be empty");
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
  email: string | null;
  sex?: string;
  relationship?: string;
}) {
  try {
    // Only check if the phone is not empty
    if (!data.phone) {
      throw new Error("Phone number cannot be empty");
    }

    if (isNaN(Number(data.age))) {
      throw new Error("Age must be a valid number");
    }

    // Check for existing patient with the same relationship, name, and phone combination
    const existingPatient = await prisma.patient.findFirst({
      where: {
        relationship: data.relationship ?? null,
        name: data.name,
        phone: data.phone,
      },
    });

    if (existingPatient) {
      // If patient exists with same relationship, name, phone - update other fields if different
      if (
        existingPatient.age !== data.age ||
        existingPatient.email !== data.email ||
        existingPatient.sex !== data.sex
      ) {
        const updatedPatient = await prisma.patient.update({
          where: {
            id: existingPatient.id,
          },
          data: {
            age: data.age,
            email: data.email,
            sex: data.sex,
          },
        });
        return updatedPatient;
      }
      return existingPatient;
    }

    // Create new patient if no existing patient found with same relationship, name, phone
    const newPatient = await prisma.patient.create({
      data: {
        name: data.name,
        age: data.age,
        phone: data.phone,
        email: data.email,
        sex: data.sex,
        relationship: data.relationship ?? null,
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
