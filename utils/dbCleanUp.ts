import { cleanupStatus } from "database/uploadRepo";

export async function cleanupLimitedStatuses() {
  await cleanupStatus('completed');
  await new Promise(r => setTimeout(r, 50));

  await cleanupStatus('canceled');
  await new Promise(r => setTimeout(r, 50));

  await cleanupStatus('failed');
}

export async function enforceAllLimitsOnBoot() {
  await cleanupLimitedStatuses();
}