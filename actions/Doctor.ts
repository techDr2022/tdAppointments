import prisma from "@/lib/db";

export async function createDoctor(data: {
  name: string;
  website: string;
  whatsapp: string;
  services?: { name: string }[];
}) {
  try {
    // Create the doctor record
    const newDoctor = await prisma.doctor.create({
      data: {
        name: data.name,
        website: data.website,
        whatsapp: data.whatsapp,
        services: {
          create:
            data.services?.map((service) => ({
              name: service.name,
            })) || [],
        },
      },
    });
    return newDoctor; // Return the created doctor
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
      throw new Error("Failed to find doctor: " + error.message);
    } else {
      console.error("Unknown error", error);
      throw new Error("Failed to find doctor: Unknown error");
    }
  }
}

export async function findDoctorById(id: number) {
  try {
    // Find the doctor by id
    const doctor = await prisma.doctor.findUnique({
      where: {
        id: id, // Filter by id
      },
      include: {
        services: true, // Optionally include related servicess
      },
    });

    if (!doctor) {
      return null;
    }
    return doctor; // Return the found doctor
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
      throw new Error("Failed to find doctor: " + error.message);
    } else {
      console.error("Unknown error", error);
      throw new Error("Failed to find doctor: Unknown error");
    }
  }
}
