import { ActionItem } from "constants/actionType";
import { getDb } from "./db";


export async function insertAction(action: ActionItem) {
  const db = await getDb();

  console.log("🟡 INSERT ACTION →", {
    id: action.id,
    type: action.type,
    status: action.status,
    payload: action.payload,
  });

  await db.runAsync(
    `
    INSERT INTO actions (
      id,
      type,
      payload,
      status,
      retryCount,
      createdAt,
      updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      action.id,
      action.type,
      action.payload,
      action.status,
      action.retryCount,
      action.createdAt,
      action.updatedAt,
    ]
  );

  console.log("🟢 ACTION INSERTED");
};

export async function getPendingActions() {
  const db = await getDb();

  const actions = await db.getAllAsync(`
    SELECT *
    FROM actions
    WHERE status = 'pending'
    ORDER BY createdAt ASC
  `);

  console.log("📥 PENDING ACTIONS FETCHED:", actions.length);

  actions.forEach((a: any, i: number) => {
    console.log(`➡️ [${i}]`, {
      id: a.id,
      type: a.type,
      status: a.status,
      retryCount: a.retryCount,
    });
  });

  return actions;
};

export async function markActionProcessing(id: string) {
  const db = await getDb();

  console.log("🟠 ACTION PROCESSING →", id);

  await db.runAsync(
    `
    UPDATE actions
    SET status = 'processing',
        updatedAt = ?
    WHERE id = ?
    `,
    [Date.now(), id]
  );

  console.log("🟠 ACTION NOW PROCESSING:", id);
};

export async function markActionCompleted(id: string) {
  const db = await getDb();

  console.log("🟢 ACTION COMPLETED →", id);

  await db.runAsync(
    `
    UPDATE actions
    SET status = 'completed',
        updatedAt = ?
    WHERE id = ?
    `,
    [Date.now(), id]
  );
};

export async function markActionFailed(id: string) {
  const db = await getDb();

  console.log("🔴 ACTION FAILED →", id);

  await db.runAsync(
    `
    UPDATE actions
    SET status = 'failed',
        retryCount = retryCount + 1,
        updatedAt = ?
    WHERE id = ?
    `,
    [Date.now(), id]
  );

  console.log("🔴 FAILURE RECORDED:", id);
};