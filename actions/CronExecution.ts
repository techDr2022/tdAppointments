import cron from "node-cron";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import { sendFeedbackMessageBMT } from "./SendMessageBmt";
import { AppointmentDetailsType } from "./SendMessage";

dayjs.extend(timezone);

export async function cronJobAction(Details: AppointmentDetailsType) {
  // Log the received details for debugging
  console.log("Received Details:", Details);

  // Parse the start time in IST (input is in IST)
  const startTimeIST = dayjs(Details.timeslot.startTime); // This is in IST
  console.log("Parsed Start Time (IST):", startTimeIST.format());

  // Add 30 minutes to the parsed start time in IST
  const rescheduledTime = startTimeIST.add(30, "minute");
  console.log(
    "Rescheduled Time (30 minutes later in IST):",
    rescheduledTime.format()
  );

  // Adjust the rescheduled time to UTC (-5:30 offset)
  const rescheduledTimeUTC = rescheduledTime;

  // Generate the cron expression based on the adjusted time (in UTC)
  const cronExpression = `${rescheduledTimeUTC.minute()} ${rescheduledTimeUTC.hour()} ${rescheduledTimeUTC.date()} ${
    rescheduledTimeUTC.month() + 1
  } *`;
  console.log("Generated Cron Expression:", cronExpression);

  // Schedule the cron job in IST (Asia/Kolkata timezone)
  cron.schedule(
    cronExpression,
    () => {
      console.log("Cron job triggered at:", new Date().toISOString());
      sendFeedbackMessageBMT(Details); // Call the function with the Details object
    },
    { scheduled: true, timezone: "Asia/Kolkata" }
  );

  console.log("Cron job has been scheduled.");
  return { message: "Cron job has been scheduled" };
}
