"use server";

import prisma from "@/lib/db";

export async function FindService(name: string) {
  try {
    const service = await prisma.service.findFirst({
      where: {
        name: name,
      },
    });
    return service;
  } catch (err) {
    console.error("Error occurred while fetching the service:", err);
    throw new Error("Failed to fetch the service. Please try again later.");
  }
}

export async function findServiceById(serviceId: number) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return null;
    }

    return service;
  } catch (error) {
    console.error("Error fetching service:", error);
    return null;
  }
}
