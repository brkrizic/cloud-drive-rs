import { ActionItem } from "constants/actionType";
import { getPendingActions, markActionCompleted, markActionFailed, markActionProcessing } from "database/actionRepo";
import { createFolder, deleteFolder } from "./fileService";
import { dbEvents } from "utils/db/dbEvents";

export async function processPendingActions() {
    const actions = await getPendingActions();

    for (const action of actions as ActionItem[]) {
    try {

        await markActionProcessing(action.id);

        const payload = JSON.parse(action.payload);

        switch (action.type) {

        case "CREATE_FOLDER":
            await createFolder(payload);
            break;

        case "DELETE_FOLDER":
            await deleteFolder(payload.folderId);
            break;
        }

        await markActionCompleted(action.id);

        dbEvents.emit();

    } catch (err) {

        console.log("SYNC FAILED:", err);

        await markActionFailed(action.id);
    }
    }
}

export function startSyncEngine() {
  setInterval(() => {
    processPendingActions();
  }, 3000);
}