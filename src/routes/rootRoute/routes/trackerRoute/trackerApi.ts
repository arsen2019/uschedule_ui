import { api } from "../../../../core/services/api";

export const TIME_SLOTS = ["09:00", "14:00", "19:00", "22:00"] as const;
export type TimeSlot = typeof TIME_SLOTS[number];

export interface DayRecord {
  day: string;
  values: Record<TimeSlot, number | null>;
}

interface SyncResponse {
  records: DayRecord[];
  initial_import_completed: boolean;
  imported_count: number;
}

export const normalizeUsername = (username: string) => username.trim().toLocaleLowerCase();

// Mobile decimal keyboards use either a dot or a comma depending on locale.
// Keep the value as text while it is being entered so intermediate values such
// as "15." are not discarded by the browser's number-input parser.
export const normalizeGlucoseInput = (value: string): string | null => {
  const normalized = value.replace(/[,\u066b]/g, ".");
  return /^\d*(?:\.\d*)?$/.test(normalized) ? normalized : null;
};

export const syncTracker = async (
  username: string,
  records: DayRecord[],
  initialImport: boolean,
): Promise<SyncResponse> => {
  const response = await api.put<SyncResponse>(`/tracker/by-username/${encodeURIComponent(username)}/sync`, {
    username,
    records,
    initial_import: initialImport,
  });
  return response.data;
};
