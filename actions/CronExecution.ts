import * as dotenv from "dotenv";
dotenv.config();
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import { Queue, Worker, Job, WorkerOptions, ConnectionOptions } from "bullmq";
import {
  sendFeedbackMessageBMT,
  sendReminderMessageBMT,
} from "./SendMessageBmt";
import { AppointmentDetailsType } from "./SendMessage";
import {
  sendFeedbackMessageAll,
  sendReminderMessageAll,
} from "./ScheduleMessage";

// Ensure dayjs is configured with the timezone plugin
dayjs.extend(timezone);

// Define JobData type for type safety
interface JobData {
  Details: AppointmentDetailsType;
}

// Create Redis connection options
const redisConnection: ConnectionOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME,
};

// The feedbackQueue with explicit type
const feedbackQueue = new Queue<JobData>("feedbackQueue", {
  connection: redisConnection,
});

// The reminderQueue with explicit type
const reminderQueue = new Queue<JobData>("reminderQueue", {
  connection: redisConnection,
});

// The cronJobAction function that schedules the feedback job
export async function cronJobAction(
  Details: AppointmentDetailsType
): Promise<{ message: string }> {
  try {
    // Log the received details for debugging
    console.log("Received Details:", Details.timeslot);

    // Parse the start time in IST (input is in IST)
    const startTimeIST = dayjs.tz(Details.timeslot.startTime, "Asia/Kolkata");
    console.log("Parsed Start Time (IST):", startTimeIST.format());

    // Add 30 minutes to the parsed start time in IST
    const rescheduledTimeIST = startTimeIST.add(1, "hour");
    console.log(
      "Rescheduled Time (1 hr later in IST):",
      rescheduledTimeIST.format()
    );

    const reframedTime = rescheduledTimeIST
      .subtract(5, "hours")
      .subtract(30, "minutes");
    console.log("ReframedTime", reframedTime.format());

    const rescheduledTimeUTC = reframedTime.tz("UTC");
    console.log("Rescheduled Time (UTC):", rescheduledTimeUTC.format());

    // Schedule the job to execute sendFeedbackMessageBMT with a delay
    const feedbackJob = await feedbackQueue.add(
      "send-feedback", // Job name
      { Details }, // Job data (the details for the appointment)
      {
        delay: rescheduledTimeUTC.diff(dayjs(), "milliseconds"), // Delay in milliseconds
      }
    );

    console.log("Feedback job has been scheduled:", feedbackJob.id);

    // Subtract 2 hours from the start time for the reminder job
    const reminderTimeIST = startTimeIST.subtract(2, "hours");
    console.log(
      "Reminder Time (2 hours earlier in IST):",
      reminderTimeIST.format()
    );

    const reframedReminderTime = reminderTimeIST
      .subtract(5, "hours")
      .subtract(30, "minutes");
    console.log("ReframedReminderTime", reframedReminderTime);

    const reminderTimeUTC = reframedReminderTime.tz("UTC");
    console.log("Reminder Time (UTC):", reminderTimeUTC.format());

    const reminderDelay = reminderTimeUTC.diff(dayjs(), "milliseconds");

    // Schedule the job to execute a reminder message only if the delay is greater than 0
    if (reminderDelay > 0) {
      const reminderJob = await reminderQueue.add(
        "send-reminder", // Job name
        { Details }, // Job data
        {
          delay: reminderDelay, // Delay in milliseconds
        }
      );

      console.log("Reminder job has been scheduled:", reminderJob.id);
    } else {
      console.log("Reminder time has already passed; job not scheduled.");
    }

    return { message: "Jobs have been scheduled" };
  } catch (err) {
    console.error("Error scheduling jobs:", err);
    return { message: "Error scheduling jobs" };
  }
}

// Prepare worker options
const workerOptions: WorkerOptions = {
  connection: redisConnection,
};

// Create a Worker to process feedback jobs in BullMQ
const feedbackWorker = new Worker<JobData>(
  "feedbackQueue", // The queue to process jobs from
  async (job: Job<JobData>) => {
    try {
      // Extract details from the job data
      const { Details } = job.data;

      // Call the sendFeedbackMessageBMT function to send the WhatsApp message
      if (Details.doctor.id == 1) {
        const result = await sendFeedbackMessageBMT(Details);
        if (result) {
          console.log("Feedback message sent successfully.");
        } else {
          console.log("Failed to send feedback message.");
        }
      } else {
        const result = await sendFeedbackMessageAll(Details);
        if (result) {
          console.log("Feedback message sent successfully.");
        } else {
          console.log("Failed to send feedback message.");
        }
      }
    } catch (err) {
      console.error("Error processing feedback job:", err);
      throw err;
    }
  },
  workerOptions
);

// Create a Worker to process reminder jobs in BullMQ
const reminderWorker = new Worker<JobData>(
  "reminderQueue", // The queue to process jobs from
  async (job: Job<JobData>) => {
    try {
      // Extract details from the job data
      const { Details } = job.data;

      // Implement the reminder message sending logic here
      console.log("Sending reminder for:", Details);

      // Simulate sending a reminder (replace with actual implementation)
      if (Details.doctor.id == 1) {
        const result = await sendReminderMessageBMT(Details); // Replace with reminder-specific function if needed

        if (result) {
          console.log("Reminder message sent successfully.");
        } else {
          console.log("Failed to send reminder message.");
        }
      } else {
        const result = await sendReminderMessageAll(Details); // Replace with reminder-specific function if needed

        if (result) {
          console.log("Reminder message sent successfully.");
        } else {
          console.log("Failed to send reminder message.");
        }
      }
    } catch (err) {
      console.error("Error processing reminder job:", err);
      throw err;
    }
  },
  workerOptions
);

// Optional: Error handling for the workers
feedbackWorker.on("failed", (job, err) => {
  console.error(`Feedback job ${job?.id} failed with error:`, err);
});

reminderWorker.on("failed", (job, err) => {
  console.error(`Reminder job ${job?.id} failed with error:`, err);
});

export { feedbackQueue, reminderQueue, feedbackWorker, reminderWorker }; // Export for potential external use
