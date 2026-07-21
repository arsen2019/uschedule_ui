import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoute } from "@tanstack/react-router";
import {
  Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { rootRoute } from "../../rootRoute";
import { DayRecord, normalizeGlucoseInput, TIME_SLOTS } from "../trackerRoute/trackerApi";
import { adminErrorMessage, AdminTrackerUser, deleteAdminRecord, getAdminRecords, getAdminUsers, patchAdminRecord } from "./trackerAdminApi";
import {
  aggregateRecords, formatIsoDate, getCalendarRange, moveCalendarRange, parseIsoDate,
  periodLabel, RangeMode,
} from "./trackerAdminUtils";
import "./trackerAdminRoute.css";

const ADMIN_TOKEN_KEY = "tracker-admin-token";
const MODES: RangeMode[] = ["day", "week", "month", "year"];

export const trackerAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tracker-admin",
  component: TrackerAdminDashboard,
});

const ChartTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;
  return <div className="admin-tooltip">
    <strong>{point.detail}</strong>
    {point.value !== null && <span>Average/value: {point.value} mmol/L</span>}
    {point.range && <span>Range: {point.range[0]}–{point.range[1]} mmol/L</span>}
  </div>;
};

function TrackerAdminDashboard() {
  const initialToken = useRef(sessionStorage.getItem(ADMIN_TOKEN_KEY) || "");
  const [token, setToken] = useState(initialToken.current);
  const [tokenInput, setTokenInput] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [users, setUsers] = useState<AdminTrackerUser[]>([]);
  const [selectedUsername, setSelectedUsername] = useState("");
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<RangeMode>("week");
  const [anchor, setAnchor] = useState(() => new Date());
  const [records, setRecords] = useState<DayRecord[]>([]);
  const [previousRecords, setPreviousRecords] = useState<DayRecord[]>([]);
  const [editDate, setEditDate] = useState(() => formatIsoDate(new Date()));
  const [editValues, setEditValues] = useState<Record<string, string>>(() => Object.fromEntries(TIME_SLOTS.map(slot => [slot, ""])));
  const [savingRecord, setSavingRecord] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [dataError, setDataError] = useState("");

  const loadUsers = useCallback(async (candidateToken: string) => {
    setLoadingUsers(true);
    setLoginError("");
    try {
      const result = await getAdminUsers(candidateToken);
      setUsers(result);
      setToken(candidateToken);
      setAuthenticated(true);
      sessionStorage.setItem(ADMIN_TOKEN_KEY, candidateToken);
      setSelectedUsername(current => result.some(user => user.username === current)
        ? current
        : result[0]?.username || "");
    } catch (error) {
      setAuthenticated(false);
      setLoginError(adminErrorMessage(error));
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (initialToken.current) void loadUsers(initialToken.current);
  }, [loadUsers]);

  const range = useMemo(() => getCalendarRange(mode, anchor), [mode, anchor]);
  const loadRecords = useCallback(async () => {
    if (!authenticated || !selectedUsername) return;
    setLoadingRecords(true);
    setDataError("");
    try {
      const previousRange = getCalendarRange(mode, moveCalendarRange(mode, anchor, -1));
      const [current, previous] = await Promise.all([
        getAdminRecords(token, selectedUsername, range.dateFrom, range.dateTo),
        getAdminRecords(token, selectedUsername, previousRange.dateFrom, previousRange.dateTo),
      ]);
      setRecords(current);
      setPreviousRecords(previous);
    } catch (error) {
      setDataError(adminErrorMessage(error));
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  }, [authenticated, range.dateFrom, range.dateTo, selectedUsername, token, mode, anchor]);

  useEffect(() => { void loadRecords(); }, [loadRecords]);

  const logout = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(""); setTokenInput(""); setAuthenticated(false); setUsers([]); setRecords([]);
  };

  const selectedUser = users.find(user => user.username === selectedUsername);
  const filteredUsers = users.filter(user => user.username.toLowerCase().includes(search.toLowerCase()));
  const chartData = useMemo(() => aggregateRecords(records, mode, anchor), [records, mode, anchor]);
  const hasChartValues = chartData.some(point => point.value !== null);
  const periodAverage = (items: DayRecord[]) => {
    const values = items.flatMap(record => TIME_SLOTS.map(slot => record.values[slot]).filter((item): item is number => item !== null));
    return values.length ? values.reduce((sum, item) => sum + item, 0) / values.length : null;
  };
  const currentAverage = periodAverage(records);
  const previousAverage = periodAverage(previousRecords);
  const trendPercent = currentAverage !== null && previousAverage
    ? ((currentAverage - previousAverage) / previousAverage) * 100
    : null;

  const editRecord = (record?: DayRecord) => {
    const day = record?.day || formatIsoDate(new Date());
    setEditDate(day);
    setEditValues(Object.fromEntries(TIME_SLOTS.map(slot => [slot, record?.values[slot]?.toString() || ""])));
  };

  const saveEditedRecord = async () => {
    if (!selectedUsername || !editDate) return;
    setSavingRecord(true); setDataError("");
    try {
      const values = Object.fromEntries(TIME_SLOTS.map(slot => {
        const raw = editValues[slot]?.trim();
        return [slot, raw ? Number(raw) : null];
      })) as DayRecord["values"];
      if (TIME_SLOTS.some(slot => values[slot] !== null && (!Number.isFinite(values[slot]) || values[slot]! <= 0))) {
        setDataError("Measurements must be positive numbers or blank.");
        return;
      }
      await patchAdminRecord(token, selectedUsername, editDate, values);
      await Promise.all([loadRecords(), loadUsers(token)]);
    } catch (error) { setDataError(adminErrorMessage(error)); }
    finally { setSavingRecord(false); }
  };

  const removeRecord = async (day: string) => {
    if (!selectedUsername || !window.confirm(`Delete every measurement for ${day}?`)) return;
    setSavingRecord(true); setDataError("");
    try {
      await deleteAdminRecord(token, selectedUsername, day);
      if (editDate === day) editRecord();
      await Promise.all([loadRecords(), loadUsers(token)]);
    } catch (error) { setDataError(adminErrorMessage(error)); }
    finally { setSavingRecord(false); }
  };

  if (!authenticated) return <main className="tracker-admin-page tracker-admin-login-page">
    <section className="tracker-admin-login">
      <span>GLUCOSE TRACKER</span>
      <h1>Admin dashboard</h1>
      <p>Enter the private admin secret configured on the backend.</p>
      <label>Admin secret<input type="password" autoFocus value={tokenInput} onChange={event => setTokenInput(event.target.value)} onKeyDown={event => event.key === "Enter" && tokenInput && loadUsers(tokenInput)} /></label>
      {loginError && <div role="alert">{loginError}</div>}
      <button disabled={!tokenInput || loadingUsers} onClick={() => loadUsers(tokenInput)}>{loadingUsers ? "Checking…" : "Sign in"}</button>
    </section>
  </main>;

  return <main className="tracker-admin-page">
    <header className="tracker-admin-topbar">
      <div><span>GLUCOSE TRACKER</span><h1>Admin dashboard</h1></div>
      <button onClick={logout}>Log out</button>
    </header>

    <div className="tracker-admin-layout">
      <aside className="tracker-admin-users">
        <div><h2>Users</h2><span>{users.length}</span></div>
        <input type="search" placeholder="Search username" aria-label="Search users" value={search} onChange={event => setSearch(event.target.value)} />
        <nav aria-label="Tracker users">
          {filteredUsers.map(user => <button className={selectedUsername === user.username ? "is-active" : ""} key={user.username} onClick={() => setSelectedUsername(user.username)}>
            <strong>@{user.username}</strong><span>{user.total_recorded_days} recorded days</span>
          </button>)}
          {!filteredUsers.length && <p>No users found.</p>}
        </nav>
      </aside>

      <section className="tracker-admin-content">
        {!selectedUser ? <div className="tracker-admin-empty"><h2>No tracker users yet</h2><p>Users appear here after their first successful sync.</p></div> : <>
          <div className="tracker-admin-user-heading"><div><span>SELECTED USER</span><h2>@{selectedUser.username}</h2></div><button onClick={loadRecords}>Refresh</button></div>
          <div className="tracker-admin-stats">
            <article><span>Recorded days</span><strong>{selectedUser.total_recorded_days}</strong></article>
            <article><span>Complete days</span><strong>{selectedUser.completed_days}</strong></article>
            <article><span>First record</span><strong>{selectedUser.first_recorded_day || "—"}</strong></article>
            <article><span>Last record</span><strong>{selectedUser.last_recorded_day || "—"}</strong></article>
          </div>

          <section className="tracker-admin-panel">
            <div className="tracker-admin-range-top">
              <div className="tracker-admin-tabs" role="tablist">{MODES.map(item => <button role="tab" aria-selected={mode === item} className={mode === item ? "is-active" : ""} key={item} onClick={() => setMode(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div>
              <div className="tracker-admin-navigator">
                <button aria-label="Previous period" onClick={() => setAnchor(moveCalendarRange(mode, anchor, -1))}>‹</button>
                <label><span>{periodLabel(mode, anchor)}</span><input aria-label="Choose period date" type="date" value={formatIsoDate(anchor)} onChange={event => event.target.value && setAnchor(parseIsoDate(event.target.value))}/></label>
                <button aria-label="Next period" onClick={() => setAnchor(moveCalendarRange(mode, anchor, 1))}>›</button>
              </div>
            </div>

            <div className={`tracker-admin-trend ${trendPercent === null ? "is-neutral" : trendPercent > 0 ? "is-up" : trendPercent < 0 ? "is-down" : "is-neutral"}`}>
              <strong>{trendPercent === null ? "—" : `${trendPercent > 0 ? "+" : ""}${trendPercent.toFixed(1)}%`}</strong>
              <span>average glucose vs previous {mode}</span>
            </div>

            {dataError && <div className="tracker-admin-error" role="alert"><span>{dataError}</span><button onClick={loadRecords}>Retry</button></div>}
            <div className="tracker-admin-chart" aria-label={`Glucose ${mode} chart`}>
              {loadingRecords ? <div className="tracker-admin-placeholder">Loading glucose records…</div> : !hasChartValues ? <div className="tracker-admin-placeholder">No glucose values in this period.</div> : <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 14, right: 16, bottom: mode === "week" ? 44 : 12, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5ece9" />
                  <XAxis dataKey="label" interval={mode === "month" ? 2 : "preserveStartEnd"} angle={mode === "week" ? -35 : 0} textAnchor={mode === "week" ? "end" : "middle"} height={mode === "week" ? 62 : 30} tick={{ fill: "#61736c", fontSize: 11 }} />
                  <YAxis unit="" tick={{ fill: "#61736c", fontSize: 11 }} label={{ value: "mmol/L", angle: -90, position: "insideLeft", fill: "#61736c" }} />
                  <Tooltip content={<ChartTooltip />} />
                  {mode === "year" && <Area type="monotone" dataKey="range" stroke="none" fill="#b9e3d3" fillOpacity={0.55} connectNulls={false} />}
                  <Line type="monotone" dataKey="value" name="Glucose" stroke="#167d5b" strokeWidth={3} dot={{ r: 3, fill: "#167d5b" }} connectNulls={false} />
                </ComposedChart>
              </ResponsiveContainer>}
            </div>
          </section>

          <section className="tracker-admin-panel tracker-admin-editor">
            <div className="tracker-admin-editor__heading"><div><h3>Add or correct a record</h3><span>Leave a measurement blank to clear that slot.</span></div><button onClick={() => editRecord()}>New date</button></div>
            <div className="tracker-admin-editor__form">
              <label>Date<input type="date" value={editDate} onChange={event => setEditDate(event.target.value)} /></label>
              {TIME_SLOTS.map(slot => <label key={slot}>{slot}<input type="text" inputMode="decimal" enterKeyHint="next" autoComplete="off" pattern="[0-9]*[.,]?[0-9]*" placeholder="—" value={editValues[slot]} onChange={event => { const next = normalizeGlucoseInput(event.target.value); if (next !== null) setEditValues(current => ({ ...current, [slot]: next })); }} /></label>)}
              <button disabled={savingRecord} onClick={saveEditedRecord}>{savingRecord ? "Saving…" : "Save record"}</button>
              {records.some(record => record.day === editDate) && <button className="is-danger" disabled={savingRecord} onClick={() => removeRecord(editDate)}>Delete day</button>}
            </div>
          </section>

          <section className="tracker-admin-panel tracker-admin-records">
            <div><h3>Records</h3><span>{range.dateFrom} to {range.dateTo}</span></div>
            <div className="tracker-admin-table-wrap"><table><thead><tr><th>Date</th>{TIME_SLOTS.map(slot => <th key={slot}>{slot}</th>)}<th>Actions</th></tr></thead><tbody>{records.map(record => <tr key={record.day}><td>{record.day}</td>{TIME_SLOTS.map(slot => <td key={slot}>{record.values[slot] === null ? "—" : `${record.values[slot]} mmol/L`}</td>)}<td><div className="tracker-admin-row-actions"><button onClick={() => editRecord(record)}>Edit</button><button className="is-danger" onClick={() => removeRecord(record.day)}>Delete</button></div></td></tr>)}</tbody></table>{!loadingRecords && !records.length && <p>No records in this period.</p>}</div>
          </section>
        </>}
      </section>
    </div>
  </main>;
}

export default TrackerAdminDashboard;
