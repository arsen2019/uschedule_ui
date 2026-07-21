import { api } from "../../../../core/services/api";

export const TIME_SLOTS = ["09:00", "14:00", "19:00", "22:00"] as const;
export type TimeSlot = typeof TIME_SLOTS[number];

export interface DayRecord {
  day: string;
  values: Record<TimeSlot, number | null>;
}

interface TrackerIdentity {
  id: string;
  token: string;
}

interface SyncResponse {
  records: DayRecord[];
  initial_import_completed: boolean;
  imported_count: number;
}

const LEGACY_IDENTITY_KEY = "glucose-tracker-identity-v1";
const LEGACY_IDENTITY_OWNER_KEY = "glucose-tracker-legacy-identity-owner";
const identityKey = (username: string) => `glucose-tracker-identity-v2:${username}`;

const randomHex = (bytes: number) => {
  const values = new Uint8Array(bytes);
  crypto.getRandomValues(values);
  return Array.from(values, value => value.toString(16).padStart(2, "0")).join("");
};

export const normalizeUsername = (username: string) => username.trim().toLocaleLowerCase();

export const getTrackerIdentity = (username: string): TrackerIdentity => {
  const key = identityKey(username);
  const existingIdentity = localStorage.getItem(key);
  const legacyOwner = localStorage.getItem(LEGACY_IDENTITY_OWNER_KEY);
  const legacyIdentity = !legacyOwner || legacyOwner === username
    ? localStorage.getItem(LEGACY_IDENTITY_KEY)
    : null;
  const saved = existingIdentity || legacyIdentity;
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as TrackerIdentity;
      if (parsed.id && parsed.token) {
        localStorage.setItem(key, JSON.stringify(parsed));
        if (!existingIdentity && legacyIdentity) {
          localStorage.setItem(LEGACY_IDENTITY_OWNER_KEY, username);
        }
        return parsed;
      }
    } catch {
      // Replace only a malformed identity. Glucose records use a separate key.
    }
  }

  const identity = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${randomHex(16)}`,
    token: randomHex(32),
  };
  localStorage.setItem(key, JSON.stringify(identity));
  return identity;
};

export const syncTracker = async (
  username: string,
  records: DayRecord[],
  initialImport: boolean,
): Promise<SyncResponse> => {
  const identity = getTrackerIdentity(username);
  const response = await api.put<SyncResponse>(`/tracker/${identity.id}/sync`, {
    username,
    records,
    initial_import: initialImport,
  }, {
    headers: { "X-Tracker-Token": identity.token },
  });
  return response.data;
};
