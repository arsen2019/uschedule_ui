import axios from "axios";
import { api } from "../../../../core/services/api";
import { DayRecord } from "../trackerRoute/trackerApi";

export interface AdminTrackerUser {
  username: string;
  first_recorded_day: string | null;
  last_recorded_day: string | null;
  total_recorded_days: number;
  completed_days: number;
  latest_record_update: string | null;
}

const adminHeaders = (token: string) => ({ "X-Admin-Token": token });

export const getAdminUsers = async (token: string) => {
  const response = await api.get<AdminTrackerUser[]>("/tracker/admin/users", {
    headers: adminHeaders(token),
  });
  return response.data;
};

export const getAdminRecords = async (
  token: string,
  username: string,
  dateFrom: string,
  dateTo: string,
) => {
  const response = await api.get<DayRecord[]>(
    `/tracker/admin/users/${encodeURIComponent(username)}/records`,
    { headers: adminHeaders(token), params: { date_from: dateFrom, date_to: dateTo } },
  );
  return response.data;
};

export const patchAdminRecord = async (
  token: string,
  username: string,
  day: string,
  values: DayRecord["values"],
) => {
  const response = await api.patch<DayRecord>(
    `/tracker/admin/users/${encodeURIComponent(username)}/records/${day}`,
    values,
    { headers: adminHeaders(token) },
  );
  return response.data;
};

export const deleteAdminRecord = async (token: string, username: string, day: string) => {
  await api.delete(`/tracker/admin/users/${encodeURIComponent(username)}/records/${day}`, {
    headers: adminHeaders(token),
  });
};

export const adminErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error) || !error.response) return "The backend is unavailable. Check the server and try again.";
  if (error.response.status === 401) return "The admin secret is incorrect.";
  if (error.response.status === 503) return "Admin access is not configured on the backend.";
  if (error.response.status === 404) return "The selected tracker user no longer exists.";
  return error.response.data?.detail || "Unable to load tracker data.";
};
