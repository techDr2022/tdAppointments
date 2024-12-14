import { NextResponse } from "next/server";
import { feedbackQueue } from "@/actions/CronExecution";

export async function GET() {
  try {
    // Fetch job counts
    const jobCounts = await feedbackQueue.getJobCounts();

    // Fetch jobs including delayed jobs
    const [waitingJobs, activeJobs, completedJobs, failedJobs, delayedJobs] =
      await Promise.all([
        feedbackQueue.getWaiting(),
        feedbackQueue.getActive(),
        feedbackQueue.getCompleted(0, 10), // Fetch last 10 completed jobs
        feedbackQueue.getFailed(0, 10), // Fetch last 10 failed jobs
        feedbackQueue.getDelayed(0, 10), // Fetch last 10 delayed jobs
      ]);

    // Format job details with execution time for delayed jobs
    const formatJobs = (jobs, includeDelayedInfo = false) =>
      jobs.map((job) => {
        const formattedJob = {
          id: job.id,
          data: job.data.,
          timestamp: job.timestamp,
          progress: job.progress,
          attemptsMade: job.attemptsMade,
        };

        // Add delayed job specific information
        if (includeDelayedInfo && job.delay) {
          formattedJob.delayUntil = new Date(Date.now() + job.delay);
          formattedJob.delayMs = job.delay;
        }

        return formattedJob;
      });

    // Response structure
    const response = {
      stats: {
        waiting: jobCounts.waiting,
        active: jobCounts.active,
        completed: jobCounts.completed,
        failed: jobCounts.failed,
        delayed: jobCounts.delayed,
        paused: jobCounts.paused,
      },
      jobs: {
        waiting: formatJobs(waitingJobs),
        active: formatJobs(activeJobs),
        completed: formatJobs(completedJobs),
        failed: formatJobs(failedJobs),
        delayed: formatJobs(delayedJobs, true), // Pass true to include delay information
      },
    };

    return NextResponse.json({
      success: true,
      message: "Queue statistics fetched successfully.",
      data: response,
    });
  } catch (error) {
    console.error("Error fetching queue stats:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch queue stats.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export const config = {
  runtime: "edge", // Ensure the API route uses the Edge runtime
};
