import prisma from "@/lib/db";

// Define types for the function parameters
type CreateTimeSlotParams = {
  date: string; // Date in the format 'YYYY-MM-DD'
  time: string; // Time in the format 'HH:mm'
  doctorid: number;
};

export async function CreateTimeSlot({
  date,
  time,
  doctorid,
}: CreateTimeSlotParams) {
  try {
    console.log("date, time", date, time);

    // Combine the date and time into a single Date object
    const combinedDateTime = new Date(`${date}T${time}:00.000Z`); // Ensure correct ISO format

    console.log("combinedDateTime", combinedDateTime);

    // Check if the time slot already exists
    const timeSlot = await prisma.timeslot.findFirst({
      where: {
        startTime: combinedDateTime,
        doctorId: doctorid, // Assuming you have a doctorId field in the timeslot table
      },
    });
    if (timeSlot) {
      console.log("Time slot already exists");
      return timeSlot;
    }

    // If no existing time slot, create a new one
    const newTimeSlot = await prisma.timeslot.create({
      data: {
        startTime: combinedDateTime,
        doctorId: doctorid,
        isAvailable: true, // Corrected property name from isAvailable to isavaliable
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
