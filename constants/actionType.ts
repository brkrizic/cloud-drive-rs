export type ActionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type ActionType =
  | "CREATE_FOLDER"
  | "DELETE_FOLDER"
  | "RENAME_FOLDER"
  | "CREATE_FILE"
  | "DELETE_FILE";

export type ActionItem = {
  id: string;

  type: ActionType;

  payload: string;

  status: ActionStatus;

  retryCount: number;

  createdAt: number;
  updatedAt?: number;
};