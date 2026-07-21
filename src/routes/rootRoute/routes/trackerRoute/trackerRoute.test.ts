import { getAutomaticSlot } from "./trackerRoute";
import { DayRecord } from "./trackerApi";

const record = (values: DayRecord["values"]): DayRecord => ({ day: "2026-07-21", values });
const nowAt = (hour: number) => new Date(2026, 6, 21, hour, 0, 0);

describe("getAutomaticSlot", () => {
  test("selects 09:00 before the first scheduled measurement", () => {
    expect(getAutomaticSlot([], "2026-07-21", nowAt(8))).toBe("09:00");
  });

  test("advances to 14:00 after 09:00 is recorded", () => {
    expect(getAutomaticSlot([record({ "09:00": 6.1, "14:00": null, "19:00": null, "22:00": null })], "2026-07-21", nowAt(10))).toBe("14:00");
  });

  test("fills an earlier missed slot before later due slots", () => {
    expect(getAutomaticSlot([record({ "09:00": null, "14:00": 6.2, "19:00": null, "22:00": null })], "2026-07-21", nowAt(15))).toBe("09:00");
  });

  test("selects the next upcoming slot when all due slots are complete", () => {
    expect(getAutomaticSlot([record({ "09:00": 6.1, "14:00": 6.2, "19:00": null, "22:00": null })], "2026-07-21", nowAt(15))).toBe("19:00");
  });

  test("uses the earliest incomplete slot on a historical date", () => {
    expect(getAutomaticSlot([record({ "09:00": 6.1, "14:00": null, "19:00": 6.4, "22:00": null })], "2026-07-21", new Date(2026, 6, 22, 10))).toBe("14:00");
  });

  test("uses 22:00 when the day is complete", () => {
    expect(getAutomaticSlot([record({ "09:00": 6.1, "14:00": 6.2, "19:00": 6.4, "22:00": 6.0 })], "2026-07-21", nowAt(23))).toBe("22:00");
  });
});
