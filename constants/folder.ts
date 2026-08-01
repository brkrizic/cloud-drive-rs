export type Folder = {
    folderId: string;
    userId: string;
    folderName: string;
    parentFolderId?: string | null;
    syncStatus: 'local' | 'syncing' | 'synced' | 'failed';
    createdAt: number;
    deleted: number;
}