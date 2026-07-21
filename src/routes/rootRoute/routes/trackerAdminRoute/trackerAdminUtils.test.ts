import { DayRecord } from "../trackerRoute/trackerApi";
import { aggregateRecords, getCalendarRange, moveCalendarRange } from "./trackerAdminUtils";

const records: DayRecord[] = [
  { day: "2026-07-01", values: { "09:00": 6, "14:00": 8, "19:00": null, "22:00": 10 } },
  { day: "2026-07-02", values: { "09:00": null, "14:00": null, "19:00": null, "22:00": null } },
  { day: "2026-08-01", values: { "09:00": 4, "14:00": 6, "19:00": 8, "22:00": 10 } },
];

describe("admin calendar ranges", () => {
  test("uses Monday through Sunday for a week", () => {
    expect(getCalendarRange("week", new Date(2026, 6, 22))).toMatchObject({ dateFrom: "2026-07-20", dateTo: "2026-07-26" });
  });

  test("moves calendar months without rolling-day drift", () => {
    expect(moveCalendarRange("month", new Date(2026, 0, 31), 1)).toEqual(new Date(2026, 1, 1));
  });
});

describe("admin chart aggregation", () => {
  test("day mode preserves all four slots including nulls", () => {
    expect(aggregateRecords(records, "day", new Date(2026, 6, 1)).map(point => point.value)).toEqual([6, 8, null, 10]);
  });

  test("month mode calculates daily averages and keeps empty days as gaps", () => {
    const points = aggregateRecords(records, "month", new Date(2026, 6, 15));
    expect(points[0].value).toBe(8);
    expect(points[1].value).toBeNull();
    expect(points).toHaveLength(31);
  });

  test("year mode calculates monthly average and min/max range", () => {
    const points = aggregateRecords(records, "year", new Date(2026, 0, 1));
    expect(points[6]).toMatchObject({ value: 8, range: [6, 10] });
    expect(points[7]).toMatchObject({ value: 7, range: [4, 10] });
    expect(points[8].value).toBeNull();
  });
});
