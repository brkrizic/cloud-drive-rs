import { useEffect } from "react";
import { useFilesQuery } from "./tanstack/useFilesQuery";
import { runDbWrite } from "database/dbService";
import { upsertFiles } from "database/fileRepo";
import { upsertFolders } from "database/folderRepo";
import { dbEvents } from "utils/db/dbEvents";


export function useSyncServerToLocalDB(setUserData?: any) {
  const {
    data,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useFilesQuery();

  useEffect(() => {
    if (!data) return;

    const allItems = data.pages.flatMap(p => p.items);

    const files = allItems.filter(i => i.type === "file");
    const folders = allItems.filter(i => i.type === "folder");

    const sync = async () => {
      await runDbWrite(() => upsertFiles(files));
      await runDbWrite(() => upsertFolders(folders));

      const user = data.pages?.[0]?.user;
      if (user && setUserData) setUserData(user);

      dbEvents.emit();
    };

    sync();
  }, [data]);

  return {
    isFetching,
    hasNextPage,
    fetchNextPage,
  };
}