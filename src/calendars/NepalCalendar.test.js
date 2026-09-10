import { describe, expect, it } from "vitest";

import nepali from "./NepalCalendar";

const YEARS = Array.from({ length: 2099 - 1970 + 1 }, (_, i) => 1970 + i);
const month = (index) => ({ index });

describe("NepalCalendar metadata", () => {
  it("describes the Bikram Sambat epoch", () => {
    expect(nepali.name).toBe("nepali");
    expect(nepali.epoch).toBe(1701212);
    expect(nepali.weekStartDayIndex).toBe(1);
  });
});

describe("getMonthLengths", () => {
  it("returns twelve months for every year in the table", () => {
    const wrong = YEARS.filter((y) => nepali.getMonthLengths(y)?.length !== 12);

    expect(wrong).toEqual([]);
  });

  it("clamps years below the table to 1970", () => {
    expect(nepali.getMonthLengths(1969)).toEqual(nepali.getMonthLengths(1970));
    expect(nepali.getMonthLengths(1)).toEqual(nepali.getMonthLengths(1970));
  });

  it("clamps years above the table to 2099", () => {
    expect(nepali.getMonthLengths(2100)).toEqual(nepali.getMonthLengths(2099));
    expect(nepali.getMonthLengths(9999)).toEqual(nepali.getMonthLengths(2099));
  });

  it("accepts a year given as a string", () => {
    expect(nepali.getMonthLengths("2000")).toEqual(nepali.getMonthLengths(2000));
  });

  it("only ever uses month lengths of 29-32 days", () => {
    const odd = YEARS.flatMap((y) => nepali.getMonthLengths(y).filter((len) => len < 29 || len > 32));

    expect(odd).toEqual([]);
  });

  // Currently fails: 1974 and 2096 BS each total 364 days, so every date after
  // them converts a day out.
  it.fails("gives every year a valid total length", () => {
    const anomalies = YEARS.map((y) => ({
      year: y,
      days: nepali.getMonthLengths(y).reduce((a, b) => a + b, 0),
    })).filter(({ days }) => days !== 365 && days !== 366);

    expect(anomalies).toEqual([]);
  });
});

describe("getDayOfYear", () => {
  it("counts the first day of the first month as day 1", () => {
    expect(nepali.getDayOfYear({ year: 2000, month: month(0), day: 1 })).toBe(1);
  });

  it("accumulates the preceding months", () => {
    const [first, second] = nepali.getMonthLengths(2000);

    expect(nepali.getDayOfYear({ year: 2000, month: month(1), day: 1 })).toBe(first + 1);
    expect(nepali.getDayOfYear({ year: 2000, month: month(2), day: 1 })).toBe(first + second + 1);
  });

  it("reaches the year length on the last day", () => {
    const lengths = nepali.getMonthLengths(2000);
    const total = lengths.reduce((a, b) => a + b, 0);

    expect(nepali.getDayOfYear({ year: 2000, month: month(11), day: lengths[11] })).toBe(total);
  });
});

describe("getAllDays", () => {
  const lengthOf = (year) => nepali.getMonthLengths(year).reduce((a, b) => a + b, 0);
  const lastDayOf = (year) => ({ year, month: month(11), day: nepali.getMonthLengths(year)[11] });
  const firstDayOf = (year) => ({ year, month: month(0), day: 1 });

  it("advances day by day within a month", () => {
    const base = nepali.getAllDays({ year: 2000, month: month(0), day: 5 });

    expect(nepali.getAllDays({ year: 2000, month: month(0), day: 6 })).toBe(base + 1);
  });

  it("increases across a 365-day year boundary", () => {
    const year = YEARS.find((y) => lengthOf(y) === 365 && y < 2099);

    expect(nepali.getAllDays(firstDayOf(year + 1))).toBeGreaterThan(nepali.getAllDays(lastDayOf(year)));
  });

  // Currently fails: the year offset is a flat 365, but 34 years in the table
  // are 366 days long. For those, the last day of the year and the first day of
  // the next collapse onto the same absolute day number.
  it.fails("keeps every date distinct across a 366-day year boundary", () => {
    const year = YEARS.find((y) => lengthOf(y) === 366 && y < 2099);

    expect(nepali.getAllDays(firstDayOf(year + 1))).toBeGreaterThan(nepali.getAllDays(lastDayOf(year)));
  });
});

describe("leap handling", () => {
  it("reports no leap days, since variable month lengths absorb them", () => {
    expect(nepali.getLeaps(2000)).toEqual([]);
    expect(nepali.leapsLength(2000)).toBe(0);
  });

  it("keeps isLeap's pass-through workaround for the date library", () => {
    // Deliberately returns the year rather than a boolean; the library only
    // checks truthiness here.
    expect(nepali.isLeap(2000)).toBe(2000);
  });
});
