import { insertAction } from "database/actionRepo";
import { deleteFolderLocal, insertFolderLocal, renameFolderLocal } from "database/folderRepo";
import { dbEvents } from "utils/db/dbEvents";
import { getUserId } from "utils/getUserToken";
import { v4 as uuid } from "uuid";

export async function createFolderLocally(folderName: string, parentFolderId: string | null) {
  console.log("📁 createFolderLocally CALLED:", folderName);

  const folderId = uuid();
  const userId = await getUserId();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  console.log("🆔 generated folderId:", folderId);
  console.log("user id: ", userId);

  await insertFolderLocal({
    folderId,
    folderName: folderName,
    parentFolderId: parentFolderId ?? null,
    userId: userId,
    syncStatus: 'local',
    createdAt: Date.now(),
    deleted: 0,
  });

  console.log("💾 local folder inserted");

  const action = {
    id: uuid(),
    type: "CREATE_FOLDER",
    payload: JSON.stringify({
      folderId,
      folderName: folderName,
      parentFolderId: parentFolderId,
    }),
    status: "pending",
    retryCount: 0,
    createdAt: Date.now(),
  };

  console.log("📦 inserting action:", action);

  await insertAction(action);

  console.log("✅ action inserted into DB");

  dbEvents.emit();

  return folderId;
};

export async function deleteFolderLocally(folderId: string){
    console.log("📤 QUEUE: delete folder action:", folderId);

    console.log("1. before delete");
    await deleteFolderLocal(folderId);
    console.log("2. after delete");

    console.log("3. before queue");
    await insertAction({
        id: uuid(),
        type: "DELETE_FOLDER",
        payload: JSON.stringify({folderId}),
        status: "pending",
        retryCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    });
    console.log("4. after queue");

    console.log("5. before emit");
    dbEvents.emit();
    console.log("6. after emit");

    console.log("✅ QUEUED: delete folder action");
};

export async function renameFolderLocally(
    folderId: string,
    newFolderName: string
) {
    console.log("📤 QUEUE: rename folder action:", {
      folderId,
      newFolderName,
    });

    console.log("1. before rename");
    await renameFolderLocal(folderId, newFolderName);
    console.log("2. after rename");

    // console.log("3. before queue");
    // await insertAction({
    //   id: uuid(),
    //   type: "RENAME_FOLDER",
    //   payload: JSON.stringify({
    //     folderId,
    //     folderName: newFolderName,
    //   }),
    //   status: "pending",
    //   retryCount: 0,
    //   createdAt: Date.now(),
    //   updatedAt: Date.now(),
    // });
    // console.log("4. after queue");

    console.log("5. before emit");
    dbEvents.emit();
    console.log("6. after emit");

    console.log("✅ QUEUED: rename folder action");
};