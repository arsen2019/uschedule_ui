import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../../rootRoute";
import { DayRecord, normalizeUsername, syncTracker, TIME_SLOTS, TimeSlot } from "./trackerApi";
import "./trackerRoute.css";

const RECORDS_KEY = "daily-tracker";
const BACKUP_KEY = "daily-tracker-pre-server-backup";
const IMPORTED_KEY = "daily-tracker-server-imported-v1";
const ACTIVE_USERNAME_KEY = "glucose-tracker-active-username";
const recordsKey = (username: string) => `${RECORDS_KEY}:${username}`;
const backupKey = (username: string) => `${BACKUP_KEY}:${username}`;
const importedKey = (username: string) => `${IMPORTED_KEY}:${username}`;
const dirtyKey = (username: string) => `daily-tracker-dirty-days:${username}`;

const EMPTY_VALUES = (): DayRecord["values"] => ({
  "09:00": null, "14:00": null, "19:00": null, "22:00": null,
});

const CHEERS = [
  "Հրաշալի՛ է, այսօրվա չափումներն ավարտված են։",
  "Ապրե՛ս, ևս մեկ հետևողական օր։",
  "Լավ աշխատանք՝ առողջությանդ հետևելը կարևոր քայլ է։",
  "Այսօրվա բոլոր չափումները գրանցված են։ Շարունակի՛ր նույն ոգով։",
  "Քո հետևողականությունը մեծ նշանակություն ունի։",
];

const today = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

export const getAutomaticSlot = (
  records: DayRecord[],
  selectedDate: string,
  now = new Date(),
): TimeSlot => {
  const record = records.find(item => item.day === selectedDate);
  const incomplete = TIME_SLOTS.filter(slot => record?.values[slot] == null);
  if (incomplete.length === 0) return "22:00";

  const localToday = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString().slice(0, 10);
  if (selectedDate < localToday) return incomplete[0];
  if (selectedDate > localToday) return incomplete[0];

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const dueIncomplete = incomplete.find(slot => Number(slot.slice(0, 2)) * 60 <= currentMinutes);
  return dueIncomplete || incomplete[0];
};

const loadLocalRecords = (key = RECORDS_KEY): DayRecord[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => item?.day && item?.values).map(item => ({
      day: item.day,
      values: Object.fromEntries(TIME_SLOTS.map(slot => [slot,
        typeof item.values[slot] === "number" ? item.values[slot] : null])) as DayRecord["values"],
    }));
  } catch {
    return [];
  }
};

const sortRecords = (records: DayRecord[]) =>
  [...records].sort((a, b) => b.day.localeCompare(a.day));

export const mergeRecords = (...sources: DayRecord[][]) => {
  const merged = new Map<string, DayRecord>();
  sources.forEach(source => source.forEach(record => {
    const current = merged.get(record.day) || { day: record.day, values: EMPTY_VALUES() };
    TIME_SLOTS.forEach(slot => {
      if (record.values[slot] !== null) current.values[slot] = record.values[slot];
    });
    merged.set(record.day, current);
  }));
  return sortRecords(Array.from(merged.values()));
};

export const selectRecordsToUpload = (
  serverRecords: DayRecord[],
  localRecords: DayRecord[],
  dirtyDays: string[],
  includeMissingDays: boolean,
) => {
  const serverDays = new Set(serverRecords.map(record => record.day));
  const dirty = new Set(dirtyDays);
  return [...localRecords].reverse().filter(record =>
    dirty.has(record.day) || (includeMissingDays && !serverDays.has(record.day))
  );
};

const loadDirtyDays = (username: string): string[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(dirtyKey(username)) || "[]");
    return Array.isArray(parsed) ? parsed.filter(day => typeof day === "string") : [];
  } catch { return []; }
};

const saveDirtyDays = (username: string, days: string[]) =>
  localStorage.setItem(dirtyKey(username), JSON.stringify(Array.from(new Set(days))));

export const trackerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/track",
  component: GlucoseTracker,
});

function GlucoseTracker() {
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem(ACTIVE_USERNAME_KEY));
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [records, setRecords] = useState<DayRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(today());
  const selectedDateRef = useRef(selectedDate);
  selectedDateRef.current = selectedDate;
  const [selectedTime, setSelectedTime] = useState<TimeSlot>("09:00");
  const [value, setValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<"syncing" | "synced" | "offline">("syncing");
  const syncSequence = useRef(Promise.resolve());
  const syncVersion = useRef(0);

  const persistAndSync = useCallback((next: DayRecord[], changedRecord: DayRecord) => {
    if (!username) return;
    const sorted = sortRecords(next);
    localStorage.setItem(recordsKey(username), JSON.stringify(sorted));
    saveDirtyDays(username, [...loadDirtyDays(username), changedRecord.day]);
    setSyncState("syncing");
    const version = ++syncVersion.current;
    syncSequence.current = syncSequence.current.then(async () => {
      try {
        const result = await syncTracker(username, [changedRecord], false);
        if (result.initial_import_completed) localStorage.setItem(importedKey(username), "true");
        if (version === syncVersion.current) {
          saveDirtyDays(username, loadDirtyDays(username).filter(day => day !== changedRecord.day));
          localStorage.setItem(recordsKey(username), JSON.stringify(result.records));
          setRecords(sortRecords(result.records));
          setSyncState("synced");
        }
      } catch {
        if (version === syncVersion.current) setSyncState("offline");
      }
    });
  }, [username]);

  const synchronizeAll = useCallback(async (includeLegacyData: boolean) => {
    if (!username) return;
    const activeDate = selectedDateRef.current;
    const perUserRecords = loadLocalRecords(recordsKey(username));
    const legacyRecords = includeLegacyData ? loadLocalRecords() : [];
    const localRecords = mergeRecords(legacyRecords, perUserRecords);
    if (includeLegacyData && !localStorage.getItem(backupKey(username))) {
      localStorage.setItem(backupKey(username), JSON.stringify(localRecords));
    }
    setSyncState("syncing");
    try {
      let result = await syncTracker(username, [], false);
      const recordsToUpload = selectRecordsToUpload(
        result.records, localRecords, loadDirtyDays(username), includeLegacyData,
      );
      for (const record of recordsToUpload) {
        result = await syncTracker(username, [record], false);
      }
      localStorage.setItem(recordsKey(username), JSON.stringify(result.records));
      saveDirtyDays(username, []);
      setRecords(sortRecords(result.records));
      setSelectedTime(getAutomaticSlot(result.records, activeDate));
      setSyncState("synced");
    } catch {
      setRecords(localRecords);
      setSyncState("offline");
    }
  }, [username]);

  useEffect(() => {
    if (!username) return;
    const perUserRecords = loadLocalRecords(recordsKey(username));
    const sorted = sortRecords(perUserRecords);
    const activeDate = selectedDateRef.current;
    setRecords(sorted);
    setSelectedTime(getAutomaticSlot(sorted, activeDate));
    void synchronizeAll(false);
  }, [username, synchronizeAll]);

  const selectUsername = () => {
    const normalized = normalizeUsername(usernameInput);
    if (normalized.length < 2 || normalized.length > 64 || /\s/.test(normalized)) {
      setUsernameError("Օգտանունը պետք է լինի 2–64 նիշ և բացատներ չպարունակի։");
      return;
    }
    localStorage.setItem(ACTIVE_USERNAME_KEY, normalized);
    setUsernameError("");
    setUsername(normalized);
  };

  const completedToday = useMemo(() => {
    const record = records.find(item => item.day === today());
    return record ? TIME_SLOTS.filter(slot => record.values[slot] !== null).length : 0;
  }, [records]);

  const save = () => {
    const glucose = Number(value);
    if (!value || !Number.isFinite(glucose) || glucose <= 0) {
      setMessage("Խնդրում ենք մուտքագրել վավեր դրական արժեք։");
      return;
    }

    const existing = records.find(item => item.day === selectedDate);
    const wasComplete = existing ? TIME_SLOTS.every(slot => existing.values[slot] !== null) : false;
    const next = records.filter(item => item.day !== selectedDate);
    const updated: DayRecord = {
      day: selectedDate,
      values: { ...(existing?.values || EMPTY_VALUES()), [selectedTime]: glucose },
    };
    next.push(updated);
    const sortedNext = sortRecords(next);
    setRecords(sortedNext);
    setSelectedTime(getAutomaticSlot(sortedNext, selectedDate));
    persistAndSync(next, updated);
    setValue("");

    if (!wasComplete && TIME_SLOTS.every(slot => updated.values[slot] !== null)) {
      setMessage(CHEERS[Math.floor(Math.random() * CHEERS.length)]);
      window.setTimeout(() => setMessage(null), 5000);
    }
  };

  const exportCsv = () => {
    const rows = ["Date," + TIME_SLOTS.join(","), ...records.map(record =>
      `${record.day},${TIME_SLOTS.map(slot => record.values[slot] ?? "").join(",")}`)];
    const url = URL.createObjectURL(new Blob(["\ufeff" + rows.join("\n")], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = "glucose-records.csv"; link.click();
    URL.revokeObjectURL(url);
  };

  if (!username) return <main className="tracker-page tracker-login-page">
    <section className="tracker-login">
      <span className="tracker-eyebrow">ԳԼՅՈՒԿՈԶԱՅԻ ՕՐԱԳԻՐ</span>
      <h1>Մուտքագրեք օգտանունը</h1>
      <p>Չափումները կպահվեն այս օգտանվան համար։</p>
      <label className="tracker-field">Օգտանուն
        <input autoFocus autoComplete="username" value={usernameInput} onChange={event => setUsernameInput(event.target.value)} onKeyDown={event => event.key === "Enter" && selectUsername()} />
      </label>
      {usernameError && <div role="alert" className="tracker-login__error">{usernameError}</div>}
      <button className="tracker-save" onClick={selectUsername}>Շարունակել</button>
    </section>
  </main>;

  return <main className="tracker-page">
    <section className="tracker-card">
      <header className="tracker-header">
        <div><span className="tracker-eyebrow">ԳԼՅՈՒԿՈԶԱՅԻ ՕՐԱԳԻՐ · @{username}</span><h1>Օրվա չափումներ</h1></div>
        <div className="tracker-account">
          <span className={`tracker-status tracker-status--${syncState}`}>
            {syncState === "syncing" ? "Համաժամեցվում է…" : syncState === "synced" ? "Պահված է սերվերում" : "Պահված է սարքում"}
          </span>
          <button disabled={syncState === "syncing"} onClick={() => synchronizeAll(true)}>{syncState === "syncing" ? "Համաժամեցվում է…" : "Համաժամեցնել ամբողջը"}</button>
        </div>
      </header>

      <div className="tracker-progress">
        <strong>Այսօր՝ {completedToday}/4</strong>
        <div className="tracker-progress__track"><div className="tracker-progress__fill" style={{width: `${completedToday * 25}%`}} /></div>
      </div>

      {message && <div role="status" className="tracker-message">🌿 {message}</div>}

      <section className="tracker-entry" aria-labelledby="new-measurement-title">
        <h2 id="new-measurement-title">Նոր չափում</h2>
        <label className="tracker-field">Ամսաթիվ<input aria-label="Ամսաթիվ" type="date" value={selectedDate} onChange={e => { const nextDate = e.target.value; setSelectedDate(nextDate); setSelectedTime(getAutomaticSlot(records, nextDate)); }}/></label>

        <fieldset className="tracker-slots">
          <legend>Ժամը</legend>
          <div className="tracker-slots__grid">
            {TIME_SLOTS.map(slot => <button type="button" key={slot} aria-pressed={selectedTime === slot} className={selectedTime === slot ? "is-selected" : ""} onClick={() => setSelectedTime(slot)}>{slot}</button>)}
          </div>
        </fieldset>

        <label className="tracker-field tracker-field--value">Գլյուկոզա (mmol/L)
          <input aria-label="Գլյուկոզա" type="number" min="0.1" step="0.1" inputMode="decimal" placeholder="օր.՝ 6.2" value={value} onChange={e => setValue(e.target.value)} onKeyDown={e => e.key === "Enter" && save()}/>
        </label>
        <button className="tracker-save" onClick={save}>Գրանցել չափումը</button>
      </section>

      <div className="tracker-history-header"><h2>Պատմություն</h2><button onClick={exportCsv}>Ներբեռնել CSV</button></div>
      <div className="tracker-history-mobile">{records.map(record => <article className="tracker-day" key={record.day}>
        <h3>{record.day.split("-").reverse().join("/")}</h3>
        <div>{TIME_SLOTS.map(slot => <div className={record.values[slot] !== null ? "has-value" : ""} key={slot}><span>{slot}</span><strong>{record.values[slot] ?? "—"}</strong></div>)}</div>
      </article>)}</div>
      <div className="tracker-table-wrap"><table><thead><tr><th>Ամսաթիվ</th>{TIME_SLOTS.map(slot => <th key={slot}>{slot}</th>)}</tr></thead><tbody>{records.map(record => <tr key={record.day}><td>{record.day.split("-").reverse().join("/")}</td>{TIME_SLOTS.map(slot => <td key={slot}>{record.values[slot] ?? "—"}</td>)}</tr>)}</tbody></table></div>
    </section>
  </main>;
}

export default GlucoseTracker;
