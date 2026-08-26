/**
 * Relative and absolute date constraints for form fields of type
 * `date`, `datetime`, and `month`.
 *
 * Offset arithmetic uses calendar units in the local timezone of `now`
 * (in Cloudflare Workers that is UTC). Clients pass `new Date()` so the
 * picker bounds match the user's clock; the server re-resolves in UTC
 * and applies a tolerance so timezone skew does not reject valid values.
 */

export interface DateOffset {
	direction: "past" | "future";
	years?: number;
	months?: number;
	days?: number;
	hours?: number;
	minutes?: number;
}

export interface DateConstraintProperties {
	dateMin?: string;
	dateMax?: string;
	dateMinOffset?: DateOffset;
	dateMaxOffset?: DateOffset;
	monthMin?: string;
	monthMax?: string;
	monthMinOffset?: DateOffset;
	monthMaxOffset?: DateOffset;
}

export type DateFieldKind = "date" | "datetime" | "month";
export type ConstraintMode = "none" | "fixed" | "relative";

export const EMPTY_OFFSET: DateOffset = { direction: "past" };

export function isOffsetActive(offset: DateOffset | null | undefined): boolean {
	if (!offset) return false;
	return (
		(offset.years ?? 0) > 0 ||
		(offset.months ?? 0) > 0 ||
		(offset.days ?? 0) > 0 ||
		(offset.hours ?? 0) > 0 ||
		(offset.minutes ?? 0) > 0
	);
}

/**
 * True when the caller persisted an offset object (including "today" with
 * all components at zero). Presence, not magnitude, decides relative mode.
 */
export function hasOffset(
	offset: DateOffset | null | undefined,
): offset is DateOffset {
	return offset !== null && offset !== undefined;
}

export function deriveConstraintMode(
	fixed: string | undefined,
	offset: DateOffset | undefined,
): ConstraintMode {
	if (hasOffset(offset)) return "relative";
	if (fixed && fixed.trim()) return "fixed";
	return "none";
}

export function applyOffset(base: Date, offset: DateOffset): Date {
	const sign = offset.direction === "past" ? -1 : 1;
	const years = sign * (offset.years ?? 0);
	const months = sign * (offset.months ?? 0);
	const days = sign * (offset.days ?? 0);
	const hours = sign * (offset.hours ?? 0);
	const minutes = sign * (offset.minutes ?? 0);

	const startDay = base.getDate();
	const unclamped = new Date(
		base.getFullYear() + years,
		base.getMonth() + months,
		1,
		base.getHours(),
		base.getMinutes(),
		base.getSeconds(),
		base.getMilliseconds(),
	);
	const maxDay = new Date(
		unclamped.getFullYear(),
		unclamped.getMonth() + 1,
		0,
	).getDate();
	unclamped.setDate(Math.min(startDay, maxDay));
	unclamped.setDate(unclamped.getDate() + days);
	unclamped.setHours(unclamped.getHours() + hours);
	unclamped.setMinutes(unclamped.getMinutes() + minutes);
	return unclamped;
}

function pad2(n: number): string {
	return String(n).padStart(2, "0");
}

export function formatDate(d: Date): string {
	return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function formatDateTime(d: Date): string {
	return `${formatDate(d)}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function formatMonth(d: Date): string {
	return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function resolveBound(
	offset: DateOffset | undefined,
	fixed: string | undefined,
	now: Date,
	format: (d: Date) => string,
): string | undefined {
	if (hasOffset(offset)) {
		return format(applyOffset(now, offset));
	}
	const trimmed = fixed?.trim();
	return trimmed ? trimmed : undefined;
}

export function resolveDateMin(
	props: DateConstraintProperties | null | undefined,
	now: Date,
): string | undefined {
	return resolveBound(props?.dateMinOffset, props?.dateMin, now, formatDate);
}

export function resolveDateMax(
	props: DateConstraintProperties | null | undefined,
	now: Date,
): string | undefined {
	return resolveBound(props?.dateMaxOffset, props?.dateMax, now, formatDate);
}

export function resolveDateTimeMin(
	props: DateConstraintProperties | null | undefined,
	now: Date,
): string | undefined {
	return resolveBound(
		props?.dateMinOffset,
		props?.dateMin,
		now,
		formatDateTime,
	);
}

export function resolveDateTimeMax(
	props: DateConstraintProperties | null | undefined,
	now: Date,
): string | undefined {
	return resolveBound(
		props?.dateMaxOffset,
		props?.dateMax,
		now,
		formatDateTime,
	);
}

export function resolveMonthMin(
	props: DateConstraintProperties | null | undefined,
	now: Date,
): string | undefined {
	return resolveBound(props?.monthMinOffset, props?.monthMin, now, formatMonth);
}

export function resolveMonthMax(
	props: DateConstraintProperties | null | undefined,
	now: Date,
): string | undefined {
	return resolveBound(props?.monthMaxOffset, props?.monthMax, now, formatMonth);
}

export function resolveBounds(
	kind: DateFieldKind,
	props: DateConstraintProperties | null | undefined,
	now: Date,
): { min?: string; max?: string } {
	if (kind === "date") {
		return { min: resolveDateMin(props, now), max: resolveDateMax(props, now) };
	}
	if (kind === "datetime") {
		return {
			min: resolveDateTimeMin(props, now),
			max: resolveDateTimeMax(props, now),
		};
	}
	return { min: resolveMonthMin(props, now), max: resolveMonthMax(props, now) };
}

export function isResolvedRangeInvalid(
	kind: DateFieldKind,
	props: DateConstraintProperties | null | undefined,
	now: Date,
): boolean {
	const { min, max } = resolveBounds(kind, props, now);
	if (!min || !max) return false;
	return min > max;
}

function parseNaiveUtc(kind: DateFieldKind, value: string): Date | null {
	if (kind === "date") {
		const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
		if (!m) return null;
		return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
	}
	if (kind === "month") {
		const m = /^(\d{4})-(\d{2})$/.exec(value);
		if (!m) return null;
		return new Date(Date.UTC(+m[1], +m[2] - 1, 1));
	}
	const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
	if (!m) return null;
	return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
}

export type RangeTolerance = "none" | "server";

/**
 * Server tolerance absorbs timezone skew between the client's local clock
 * (used to render `min`/`max`) and UTC on the worker:
 * date = ±1 day, datetime = ±24 hours, month = ±1 month.
 */
function expandBound(
	kind: DateFieldKind,
	bound: Date,
	direction: "min" | "max",
): Date {
	const sign = direction === "min" ? -1 : 1;
	if (kind === "datetime") {
		return new Date(bound.getTime() + sign * 24 * 60 * 60 * 1000);
	}
	if (kind === "month") {
		return new Date(
			Date.UTC(
				bound.getUTCFullYear(),
				bound.getUTCMonth() + sign,
				bound.getUTCDate(),
			),
		);
	}
	return new Date(bound.getTime() + sign * 24 * 60 * 60 * 1000);
}

export function isValueInRange(
	kind: DateFieldKind,
	value: string,
	bounds: { min?: string; max?: string },
	tolerance: RangeTolerance = "none",
): boolean {
	const parsed = parseNaiveUtc(kind, value);
	if (!parsed) return false;

	if (bounds.min) {
		const minDate = parseNaiveUtc(kind, bounds.min);
		if (minDate) {
			const floor =
				tolerance === "server" ? expandBound(kind, minDate, "min") : minDate;
			if (parsed.getTime() < floor.getTime()) return false;
		}
	}
	if (bounds.max) {
		const maxDate = parseNaiveUtc(kind, bounds.max);
		if (maxDate) {
			const ceil =
				tolerance === "server" ? expandBound(kind, maxDate, "max") : maxDate;
			if (parsed.getTime() > ceil.getTime()) return false;
		}
	}
	return true;
}

function unitPart(
	count: number,
	singular: string,
	plural: string,
): string | null {
	if (count <= 0) return null;
	return `${count} ${count === 1 ? singular : plural}`;
}

export function describeOffset(offset: DateOffset, lang: "en" | "es"): string {
	const parts =
		lang === "es"
			? [
					unitPart(offset.years ?? 0, "año", "años"),
					unitPart(offset.months ?? 0, "mes", "meses"),
					unitPart(offset.days ?? 0, "día", "días"),
					unitPart(offset.hours ?? 0, "hora", "horas"),
					unitPart(offset.minutes ?? 0, "minuto", "minutos"),
				]
			: [
					unitPart(offset.years ?? 0, "year", "years"),
					unitPart(offset.months ?? 0, "month", "months"),
					unitPart(offset.days ?? 0, "day", "days"),
					unitPart(offset.hours ?? 0, "hour", "hours"),
					unitPart(offset.minutes ?? 0, "minute", "minutes"),
				];
	const filled = parts.filter((p): p is string => p !== null);
	if (filled.length === 0) {
		return lang === "es" ? "hoy" : "today";
	}
	const joined =
		lang === "es"
			? filled.length === 1
				? filled[0]
				: `${filled.slice(0, -1).join(", ")} y ${filled[filled.length - 1]}`
			: filled.length === 1
				? filled[0]
				: `${filled.slice(0, -1).join(", ")} and ${filled[filled.length - 1]}`;
	if (offset.direction === "past") {
		return lang === "es" ? `hace ${joined}` : `${joined} ago`;
	}
	return lang === "es" ? `dentro de ${joined}` : `${joined} from today`;
}

const DATE_UNITS = new Set(["years", "months", "days"]);
const DATETIME_UNITS = new Set(["years", "months", "days", "hours", "minutes"]);
const MONTH_UNITS = new Set(["years", "months"]);

export function offsetHasDisallowedUnits(
	kind: DateFieldKind,
	offset: DateOffset,
): boolean {
	const allowed =
		kind === "date"
			? DATE_UNITS
			: kind === "datetime"
				? DATETIME_UNITS
				: MONTH_UNITS;
	if (!allowed.has("hours") && (offset.hours ?? 0) > 0) return true;
	if (!allowed.has("minutes") && (offset.minutes ?? 0) > 0) return true;
	if (!allowed.has("days") && (offset.days ?? 0) > 0) return true;
	return false;
}
