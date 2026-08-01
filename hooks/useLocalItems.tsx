import { ExplorerItem } from "constants/fileItem";
import { getItemsFromDb } from "database/fileRepo";
import { useEffect, useState } from "react";
import { dbEvents } from "utils/db/dbEvents";

export function useLocalItems(parentFolderId?: string) {
  const [items, setItems] = useState<ExplorerItem[]>([]);

  const load = async () => {
    const data = await getItemsFromDb(parentFolderId);
    setItems(data);
  };

  useEffect(() => {
    load();

    const unsub = dbEvents.subscribe(() => {
      load();
    });

    return unsub;
  }, [parentFolderId]);

  return items;
}