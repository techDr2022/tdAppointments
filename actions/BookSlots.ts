"use server";

import prisma from "@/lib/db";

export async function BookedSlots(doctorId: number) {
  try {
    const timeslots = await prisma.timeslot.findMany({
      where: {
        doctorId: doctorId,
      },
    });
    if (timeslots) {
      if (timeslots.length < 0) {
        console.log("No timeSlots found");
        return null;
      }
    } else {
      console.log("No timeSlots found1");
      return null;
    }
    const bookedSlots =
      timeslots.filter((timeslot) => !timeslot.isAvailable) || [];

    const result = bookedSlots.map((bookedSlot) => {
      const arr = bookedSlot.startTime.toISOString().split("T");
      const trimmedTime = arr[1].slice(0, 5);
      return { dateKey: arr[0], time: trimmedTime };
    });
    return result;
  } catch (err: unknown) {
    console.error(err);
  }
}
