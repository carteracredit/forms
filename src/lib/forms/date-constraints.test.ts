import { describe, expect, it } from "vitest";
import {
	applyOffset,
	describeOffset,
	deriveConstraintMode,
	formatDate,
	formatDateTime,
	formatMonth,
	isResolvedRangeInvalid,
	isValueInRange,
	offsetHasDisallowedUnits,
	resolveDateMin,
	resolveDateMax,
	resolveDateTimeMin,
	resolveMonthMin,
	type DateOffset,
} from "./date-constraints";

describe("applyOffset", () => {
	it("subtracts years into the past", () => {
		const base = new Date(2026, 7, 25, 12, 0, 0);
		const result = applyOffset(base, { direction: "past", years: 2 });
		expect(formatDate(result)).toBe("2024-08-25");
	});

	it("adds years into the future", () => {
		const base = new Date(2026, 7, 25, 12, 0, 0);
		const result = applyOffset(base, { direction: "future", years: 1 });
		expect(formatDate(result)).toBe("2027-08-25");
	});

	it("clamps end-of-month when adding a month to Jan 31", () => {
		const base = new Date(2026, 0, 31, 12, 0, 0);
		const result = applyOffset(base, { direction: "future", months: 1 });
		expect(formatDate(result)).toBe("2026-02-28");
	});

	it("clamps leap day when adding a year to Feb 29", () => {
		const base = new Date(2024, 1, 29, 12, 0, 0);
		const result = applyOffset(base, { direction: "future", years: 1 });
		expect(formatDate(result)).toBe("2025-02-28");
	});

	it("accumulates years then months then days in that order", () => {
		const base = new Date(2026, 0, 31, 12, 0, 0);
		const result = applyOffset(base, {
			direction: "future",
			years: 0,
			months: 1,
			days: 1,
		});
		expect(formatDate(result)).toBe("2026-03-01");
	});

	it("applies hours and minutes for datetime offsets", () => {
		const base = new Date(2026, 7, 25, 10, 0, 0);
		const result = applyOffset(base, {
			direction: "past",
			days: 15,
			hours: 2,
		});
		expect(formatDateTime(result)).toBe("2026-08-10T08:00");
	});

	it("treats an empty offset as today", () => {
		const base = new Date(2026, 7, 25, 15, 30, 0);
		const result = applyOffset(base, { direction: "past" });
		expect(formatDateTime(result)).toBe("2026-08-25T15:30");
	});
});

describe("resolve* bounds", () => {
	const now = new Date(2026, 7, 25, 12, 0, 0);

	it("prefers an offset over a fixed date", () => {
		const min = resolveDateMin(
			{
				dateMin: "2000-01-01",
				dateMinOffset: { direction: "past", years: 2 },
			},
			now,
		);
		expect(min).toBe("2024-08-25");
	});

	it("falls back to the fixed date when no offset is set", () => {
		expect(resolveDateMax({ dateMax: "2030-12-31" }, now)).toBe("2030-12-31");
	});

	it("resolves datetime bounds with hours", () => {
		const min = resolveDateTimeMin(
			{ dateMinOffset: { direction: "past", days: 1, hours: 3 } },
			now,
		);
		expect(min).toBe("2026-08-24T09:00");
	});

	it("resolves month bounds using years and months", () => {
		const min = resolveMonthMin(
			{ monthMinOffset: { direction: "past", years: 2, months: 1 } },
			now,
		);
		expect(min).toBe("2024-07");
	});

	it("returns undefined when neither offset nor fixed is set", () => {
		expect(resolveDateMin({}, now)).toBeUndefined();
	});
});

describe("isResolvedRangeInvalid", () => {
	const now = new Date(2026, 7, 25, 12, 0, 0);

	it("is true when min resolves after max", () => {
		expect(
			isResolvedRangeInvalid(
				"date",
				{
					dateMinOffset: { direction: "future", days: 10 },
					dateMaxOffset: { direction: "future", days: 1 },
				},
				now,
			),
		).toBe(true);
	});

	it("is false when min is before max", () => {
		expect(
			isResolvedRangeInvalid(
				"date",
				{
					dateMinOffset: { direction: "past", days: 15 },
					dateMaxOffset: { direction: "future", days: 45 },
				},
				now,
			),
		).toBe(false);
	});
});

describe("isValueInRange", () => {
	it("rejects a date before min without tolerance", () => {
		expect(
			isValueInRange("date", "2026-08-01", { min: "2026-08-10" }, "none"),
		).toBe(false);
	});

	it("accepts a date one day before min with server tolerance", () => {
		expect(
			isValueInRange("date", "2026-08-09", { min: "2026-08-10" }, "server"),
		).toBe(true);
	});

	it("rejects a datetime more than 24h outside the max with server tolerance", () => {
		expect(
			isValueInRange(
				"datetime",
				"2026-08-27T13:00",
				{ max: "2026-08-25T12:00" },
				"server",
			),
		).toBe(false);
	});

	it("accepts a month one month before min with server tolerance", () => {
		expect(
			isValueInRange("month", "2026-07", { min: "2026-08" }, "server"),
		).toBe(true);
	});
});

describe("describeOffset", () => {
	const offset: DateOffset = {
		direction: "past",
		years: 2,
		months: 1,
	};

	it("describes a past offset in English", () => {
		expect(describeOffset(offset, "en")).toBe("2 years and 1 month ago");
	});

	it("describes a past offset in Spanish", () => {
		expect(describeOffset(offset, "es")).toBe("hace 2 años y 1 mes");
	});

	it("describes a future offset in English", () => {
		expect(describeOffset({ direction: "future", months: 3 }, "en")).toBe(
			"3 months from today",
		);
	});

	it("describes today when all components are zero", () => {
		expect(describeOffset({ direction: "past" }, "en")).toBe("today");
		expect(describeOffset({ direction: "future" }, "es")).toBe("hoy");
	});
});

describe("deriveConstraintMode", () => {
	it("prefers relative when an offset object is present", () => {
		expect(
			deriveConstraintMode("2020-01-01", { direction: "past", years: 2 }),
		).toBe("relative");
	});

	it("returns fixed when only a string is present", () => {
		expect(deriveConstraintMode("2020-01-01", undefined)).toBe("fixed");
	});

	it("returns none when neither is present", () => {
		expect(deriveConstraintMode(undefined, undefined)).toBe("none");
	});
});

describe("offsetHasDisallowedUnits", () => {
	it("rejects hours on a date field", () => {
		expect(
			offsetHasDisallowedUnits("date", { direction: "past", hours: 2 }),
		).toBe(true);
	});

	it("rejects days on a month field", () => {
		expect(
			offsetHasDisallowedUnits("month", { direction: "past", days: 1 }),
		).toBe(true);
	});

	it("allows hours on a datetime field", () => {
		expect(
			offsetHasDisallowedUnits("datetime", {
				direction: "past",
				days: 15,
				hours: 2,
			}),
		).toBe(false);
	});
});
