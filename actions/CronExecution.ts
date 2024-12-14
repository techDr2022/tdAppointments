import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import { Queue, Worker, Job, WorkerOptions, ConnectionOptions } from "bullmq";
import { sendFeedbackMessageBMT } from "./SendMessageBmt";
import { AppointmentDetailsType } from "./SendMessage";

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

// The cronJobAction function that schedules the job
export async function cronJobAction(
  Details: AppointmentDetailsType
): Promise<{ message: string }> {
  try {
    // Log the received details for debugging
    console.log("Received Details:", Details);

    // Parse the start time in IST (input is in IST)
    const startTimeIST = dayjs(Details.timeslot.startTime); // This is in IST
    console.log("Parsed Start Time (IST):", startTimeIST.format());

    // Add 30 minutes to the parsed start time in IST
    const rescheduledTimeIST = startTimeIST.add(60, "minute");
    console.log(
      "Rescheduled Time (30 minutes later in IST):",
      rescheduledTimeIST.format()
    );

    const rescheduledTimeUTC = rescheduledTimeIST.tz("UTC");
    console.log("Rescheduled Time (UTC):", rescheduledTimeUTC.format());

    // Schedule the job to execute sendFeedbackMessageBMT with a delay
    const job = await feedbackQueue.add(
      "send-feedback", // Job name
      { Details }, // Job data (the details for the appointment)
      {
        delay: rescheduledTimeUTC.diff(dayjs(), "milliseconds"), // Delay in milliseconds
      }
    );

    console.log("Feedback job has been scheduled:", job.id);
    return { message: "Job has been scheduled" };
  } catch (err) {
    console.error("Error scheduling job:", err);
    return { message: "Error scheduling job" };
  }
}

// Prepare worker options
const workerOptions: WorkerOptions = {
  connection: redisConnection,
};

// Create a Worker to process jobs in BullMQ
const worker = new Worker<JobData>(
  "feedbackQueue", // The queue to process jobs from
  async (job: Job<JobData>) => {
    try {
      // Extract details from the job data
      const { Details } = job.data;

      // Call the sendFeedbackMessageBMT function to send the WhatsApp message
      const result = await sendFeedbackMessageBMT(Details);

      if (result) {
        console.log("Feedback message sent successfully.");
      } else {
        console.log("Failed to send feedback message.");
      }
    } catch (err) {
      console.error("Error processing feedback job:", err);
      throw err;
    }
  },
  workerOptions
);

// Optional: Error handling for the worker
worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed with error:`, err);
});

export { feedbackQueue, worker }; // Export for potential external use
