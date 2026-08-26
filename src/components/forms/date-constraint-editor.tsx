"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { MonthPicker } from "@/components/ui/month-picker";
import { useLanguage } from "@/components/LanguageProvider";
import {
	describeOffset,
	type ConstraintMode,
	type DateFieldKind,
	type DateOffset,
} from "@/lib/forms/date-constraints";

export interface DateConstraintValue {
	minMode: ConstraintMode;
	maxMode: ConstraintMode;
	minFixed: string;
	maxFixed: string;
	minOffset: DateOffset;
	maxOffset: DateOffset;
}

interface DateConstraintEditorProps {
	kind: DateFieldKind;
	value: DateConstraintValue;
	onChange: (next: DateConstraintValue) => void;
	rangeInvalid?: boolean;
}

const DEFAULT_OFFSET: DateOffset = { direction: "past", days: 1 };

function defaultOffsetFor(
	kind: DateFieldKind,
	side: "min" | "max",
): DateOffset {
	if (kind === "month") {
		return {
			direction: side === "min" ? "past" : "future",
			months: 1,
		};
	}
	return {
		direction: side === "min" ? "past" : "future",
		days: 1,
	};
}

function OffsetFields({
	kind,
	offset,
	onChange,
}: {
	kind: DateFieldKind;
	offset: DateOffset;
	onChange: (next: DateOffset) => void;
}) {
	const { t, language } = useLanguage();
	const showDays = kind === "date" || kind === "datetime";
	const showTime = kind === "datetime";

	function setNum(
		key: "years" | "months" | "days" | "hours" | "minutes",
		raw: string,
	) {
		const n = raw === "" ? undefined : Math.max(0, Number(raw));
		onChange({
			...offset,
			[key]: Number.isFinite(n as number) ? n : undefined,
		});
	}

	return (
		<div className="space-y-2">
			<div>
				<Label>{t("fieldProperties.offsetDirection")}</Label>
				<Select
					value={offset.direction}
					onValueChange={(v) =>
						onChange({
							...offset,
							direction: v as DateOffset["direction"],
						})
					}
				>
					<SelectTrigger className="mt-1 w-full">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="past">
							{t("fieldProperties.offsetPast")}
						</SelectItem>
						<SelectItem value="future">
							{t("fieldProperties.offsetFuture")}
						</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div className="grid grid-cols-2 gap-2">
				<div>
					<Label>{t("fieldProperties.offsetYears")}</Label>
					<Input
						type="number"
						min={0}
						className="mt-1"
						value={offset.years ?? ""}
						onChange={(e) => setNum("years", e.target.value)}
					/>
				</div>
				<div>
					<Label>{t("fieldProperties.offsetMonths")}</Label>
					<Input
						type="number"
						min={0}
						className="mt-1"
						value={offset.months ?? ""}
						onChange={(e) => setNum("months", e.target.value)}
					/>
				</div>
				{showDays && (
					<div>
						<Label>{t("fieldProperties.offsetDays")}</Label>
						<Input
							type="number"
							min={0}
							className="mt-1"
							value={offset.days ?? ""}
							onChange={(e) => setNum("days", e.target.value)}
						/>
					</div>
				)}
				{showTime && (
					<>
						<div>
							<Label>{t("fieldProperties.offsetHours")}</Label>
							<Input
								type="number"
								min={0}
								className="mt-1"
								value={offset.hours ?? ""}
								onChange={(e) => setNum("hours", e.target.value)}
							/>
						</div>
						<div>
							<Label>{t("fieldProperties.offsetMinutes")}</Label>
							<Input
								type="number"
								min={0}
								className="mt-1"
								value={offset.minutes ?? ""}
								onChange={(e) => setNum("minutes", e.target.value)}
							/>
						</div>
					</>
				)}
			</div>
			<p className="text-xs text-muted-foreground">
				{t("fieldProperties.offsetPreview")}:{" "}
				{describeOffset(offset, language === "es" ? "es" : "en")}
			</p>
		</div>
	);
}

function BoundEditor({
	kind,
	label,
	mode,
	fixed,
	offset,
	onModeChange,
	onFixedChange,
	onOffsetChange,
}: {
	kind: DateFieldKind;
	label: string;
	mode: ConstraintMode;
	fixed: string;
	offset: DateOffset;
	onModeChange: (mode: ConstraintMode) => void;
	onFixedChange: (value: string) => void;
	onOffsetChange: (value: DateOffset) => void;
}) {
	const { t } = useLanguage();
	const fixedInputType = kind === "datetime" ? "datetime-local" : "date";

	return (
		<div className="space-y-2">
			<Label>{label}</Label>
			<Select
				value={mode}
				onValueChange={(v) => {
					const next = v as ConstraintMode;
					onModeChange(next);
					if (next === "relative" && !offset.direction) {
						onOffsetChange(DEFAULT_OFFSET);
					}
				}}
			>
				<SelectTrigger className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="none">
						{t("fieldProperties.constraintNone")}
					</SelectItem>
					<SelectItem value="fixed">
						{t("fieldProperties.constraintFixed")}
					</SelectItem>
					<SelectItem value="relative">
						{t("fieldProperties.constraintRelative")}
					</SelectItem>
				</SelectContent>
			</Select>
			{mode === "fixed" && kind === "month" && (
				<MonthPicker value={fixed} onChange={onFixedChange} className="mt-1" />
			)}
			{mode === "fixed" && kind !== "month" && (
				<Input
					type={fixedInputType}
					value={fixed}
					onChange={(e) => onFixedChange(e.target.value)}
					className="mt-1"
				/>
			)}
			{mode === "relative" && (
				<OffsetFields kind={kind} offset={offset} onChange={onOffsetChange} />
			)}
		</div>
	);
}

export function DateConstraintEditor({
	kind,
	value,
	onChange,
	rangeInvalid,
}: DateConstraintEditorProps) {
	const { t } = useLanguage();

	return (
		<div className="space-y-3">
			<div className="grid grid-cols-2 gap-3">
				<BoundEditor
					kind={kind}
					label={t("fieldProperties.min")}
					mode={value.minMode}
					fixed={value.minFixed}
					offset={value.minOffset}
					onModeChange={(minMode) => {
						const minOffset =
							minMode === "relative" && !value.minOffset.direction
								? defaultOffsetFor(kind, "min")
								: value.minOffset;
						onChange({ ...value, minMode, minOffset });
					}}
					onFixedChange={(minFixed) => onChange({ ...value, minFixed })}
					onOffsetChange={(minOffset) => onChange({ ...value, minOffset })}
				/>
				<BoundEditor
					kind={kind}
					label={t("fieldProperties.max")}
					mode={value.maxMode}
					fixed={value.maxFixed}
					offset={value.maxOffset}
					onModeChange={(maxMode) => {
						const maxOffset =
							maxMode === "relative" && !value.maxOffset.direction
								? defaultOffsetFor(kind, "max")
								: value.maxOffset;
						onChange({ ...value, maxMode, maxOffset });
					}}
					onFixedChange={(maxFixed) => onChange({ ...value, maxFixed })}
					onOffsetChange={(maxOffset) => onChange({ ...value, maxOffset })}
				/>
			</div>
			{rangeInvalid && (
				<p className="text-xs text-destructive">
					{t("fieldProperties.rangeInvalid")}
				</p>
			)}
		</div>
	);
}
