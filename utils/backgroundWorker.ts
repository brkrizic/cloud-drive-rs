import BackgroundService from "react-native-background-actions";
import { backgroundUploadTask, options } from "utils/backgroundUploadTask";
import { hasPendingBackgroundJobs } from "database/uploadRepo";

let workerRunning = false;

export async function startBackgroundWorker() {
  try {
    console.log("🟡 [Worker] startBackgroundWorker called");

    // 1. prevent duplicate workers
    if (workerRunning) {
      console.log("🟠 [Worker] already running → skipping start");
      return;
    }

    // 2. check DB if there is anything to process
    console.log("🔍 [Worker] checking pending jobs...");

    const hasJobs = await hasPendingBackgroundJobs();

    console.log("📦 [Worker] pending jobs:", hasJobs);

    if (!hasJobs) {
      console.log("🟢 [Worker] no jobs found → not starting worker");
      workerRunning = false;
      return;
    }

    // 3. mark as running BEFORE start
    workerRunning = true;

    console.log(
      "🚀 [Worker] STARTING BACKGROUND SERVICE at:",
      Date.now()
    );

    // 4. start worker
    await BackgroundService.start(
      async () => {
        console.log("⚙️ [Worker] backgroundUploadTask INIT");

        await backgroundUploadTask(
          async () => {
            console.log("🏁 [Worker] all jobs completed → stopping worker");

            workerRunning = false;

            await BackgroundService.stop();

            console.log("🛑 [Worker] stopped successfully");
          }
        );
      },
      options
    );

    console.log("✅ [Worker] BackgroundService.start() called successfully");

  } catch (e) {
    workerRunning = false;

    console.error("❌ [Worker] failed to start worker:", e);
  }
}