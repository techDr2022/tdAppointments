import prisma from "@/lib/db";

// Update the type definition
type CreateTimeSlotParams = {
  date: string;
  time: string;
  doctorid: number;
  type: "MANUAL" | "FORM";
};

export async function CreateTimeSlot({
  type,
  date,
  time,
  doctorid,
}: CreateTimeSlotParams) {
  try {
    const combinedDateTime = new Date(`${date}T${time}:00.000Z`);

    // Check if the time slot already exists
    const timeSlot = await prisma.timeslot.findFirst({
      where: {
        startTime: combinedDateTime,
        doctorId: doctorid,
      },
    });

    if (timeSlot) {
      return timeSlot;
    }
    const newTimeSlot = await prisma.timeslot.create({
      data: {
        startTime: combinedDateTime,
        doctorId: doctorid,
        isAvailable: true,
        type,
      },
    });

    return newTimeSlot;
  } catch (error) {
    console.error("Error creating time slot:", error);
    throw new Error("Failed to create time slot");
  }
}

export async function findTimeslotById(timeslotId: number) {
  try {
    const timeslot = await prisma.timeslot.findUnique({
      where: { id: timeslotId },
    });

    if (!timeslot) {
      return null;
    }

    return timeslot;
  } catch (error) {
    console.error(error);
    return null;
  }
}
