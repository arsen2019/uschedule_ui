import { DayRecord, TIME_SLOTS } from "../trackerRoute/trackerApi";

export type RangeMode = "day" | "week" | "month" | "year";

export interface ChartPoint {
  label: string;
  value: number | null;
  range?: [number, number] | null;
  detail: string;
}

const pad = (value: number) => String(value).padStart(2, "0");
export const formatIsoDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const parseIsoDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const getCalendarRange = (mode: RangeMode, anchor: Date) => {
  let start: Date;
  let end: Date;
  if (mode === "day") {
    start = new Date(anchor);
    end = new Date(anchor);
  } else if (mode === "week") {
    const mondayOffset = (anchor.getDay() + 6) % 7;
    start = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - mondayOffset);
    end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  } else if (mode === "month") {
    start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  } else {
    start = new Date(anchor.getFullYear(), 0, 1);
    end = new Date(anchor.getFullYear(), 11, 31);
  }
  return { dateFrom: formatIsoDate(start), dateTo: formatIsoDate(end), start, end };
};

export const moveCalendarRange = (mode: RangeMode, anchor: Date, direction: -1 | 1) => {
  if (mode === "day") return new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + direction);
  if (mode === "week") return new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + direction * 7);
  if (mode === "month") return new Date(anchor.getFullYear(), anchor.getMonth() + direction, 1);
  return new Date(anchor.getFullYear() + direction, anchor.getMonth(), 1);
};

const valuesForRecord = (record?: DayRecord) => record
  ? TIME_SLOTS.map(slot => record.values[slot]).filter((value): value is number => value !== null)
  : [];
const average = (values: number[]) => values.length
  ? Number((values.reduce((total, value) => total + value, 0) / values.length).toFixed(2))
  : null;

export const aggregateRecords = (
  records: DayRecord[],
  mode: RangeMode,
  anchor: Date,
): ChartPoint[] => {
  const byDay = new Map(records.map(record => [record.day, record]));
  const { start, end } = getCalendarRange(mode, anchor);

  if (mode === "day") {
    const record = byDay.get(formatIsoDate(start));
    return TIME_SLOTS.map(slot => ({
      label: slot,
      value: record?.values[slot] ?? null,
      detail: `${formatIsoDate(start)} at ${slot}`,
    }));
  }

  if (mode === "week") {
    const points: ChartPoint[] = [];
    for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      const day = formatIsoDate(cursor);
      const record = byDay.get(day);
      TIME_SLOTS.forEach(slot => {
        const value = record?.values[slot] ?? null;
        if (value !== null) points.push({
          label: `${pad(cursor.getMonth() + 1)}/${pad(cursor.getDate())} ${slot}`,
          value,
          detail: `${day} at ${slot}`,
        });
      });
    }
    return points;
  }

  if (mode === "month") {
    const points: ChartPoint[] = [];
    for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      const day = formatIsoDate(cursor);
      points.push({
        label: String(cursor.getDate()),
        value: average(valuesForRecord(byDay.get(day))),
        detail: day,
      });
    }
    return points;
  }

  return Array.from({ length: 12 }, (_, month) => {
    const values = records
      .filter(record => parseIsoDate(record.day).getMonth() === month)
      .flatMap(record => valuesForRecord(record));
    return {
      label: new Intl.DateTimeFormat("en", { month: "short" }).format(new Date(anchor.getFullYear(), month, 1)),
      value: average(values),
      range: values.length ? [Math.min(...values), Math.max(...values)] : null,
      detail: new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(anchor.getFullYear(), month, 1)),
    };
  });
};

export const periodLabel = (mode: RangeMode, anchor: Date) => {
  const { start, end } = getCalendarRange(mode, anchor);
  const date = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" });
  if (mode === "day") return date.format(start);
  if (mode === "year") return String(anchor.getFullYear());
  if (mode === "month") return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(start);
  return `${date.format(start)} – ${date.format(end)}`;
};
