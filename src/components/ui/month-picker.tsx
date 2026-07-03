"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

const MONTH_NAMES_EN = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

const MONTH_NAMES_FULL_EN = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

/** Parse a YYYY-MM string into { year, month } (month is 0-based). Returns null if invalid. */
function parseYearMonth(value: string): { year: number; month: number } | null {
	if (!/^\d{4}-\d{2}$/.test(value)) return null;
	const [y, m] = value.split("-").map(Number);
	if (m < 1 || m > 12) return null;
	return { year: y, month: m - 1 };
}

/** Format { year, month } (0-based) to YYYY-MM */
function formatYearMonth(year: number, month: number): string {
	return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function isMonthDisabled(
	year: number,
	month: number,
	min?: string,
	max?: string,
): boolean {
	const val = formatYearMonth(year, month);
	if (min && val < min) return true;
	if (max && val > max) return true;
	return false;
}

export interface MonthPickerProps {
	/** Selected value in YYYY-MM format */
	value?: string;
	onChange?: (value: string) => void;
	/** Minimum allowed month in YYYY-MM format */
	min?: string;
	/** Maximum allowed month in YYYY-MM format */
	max?: string;
	disabled?: boolean;
	required?: boolean;
	placeholder?: string;
	className?: string;
	id?: string;
}

export function MonthPicker({
	value,
	onChange,
	min,
	max,
	disabled,
	placeholder = "Select month",
	className,
	id,
}: MonthPickerProps) {
	const parsed = value ? parseYearMonth(value) : null;

	const [open, setOpen] = React.useState(false);
	const [viewYear, setViewYear] = React.useState<number>(
		parsed?.year ?? new Date().getFullYear(),
	);

	React.useEffect(() => {
		if (parsed) setViewYear(parsed.year);
	}, [value]);

	function handleSelect(month: number) {
		if (isMonthDisabled(viewYear, month, min, max)) return;
		onChange?.(formatYearMonth(viewYear, month));
		setOpen(false);
	}

	const displayLabel = parsed
		? `${MONTH_NAMES_FULL_EN[parsed.month]} ${parsed.year}`
		: placeholder;

	return (
		<Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					variant="outline"
					disabled={disabled}
					data-testid="month-picker-trigger"
					className={cn(
						"w-full justify-start text-left font-normal",
						!parsed && "text-muted-foreground",
						className,
					)}
					onClick={() => !disabled && setOpen((prev) => !prev)}
					type="button"
				>
					<CalendarDays className="mr-2 size-4 shrink-0" />
					{displayLabel}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-64 p-3" align="start">
				{/* Year navigation */}
				<div className="mb-3 flex items-center justify-between">
					<Button
						variant="ghost"
						size="icon-sm"
						type="button"
						aria-label="Previous year"
						onClick={() => setViewYear((y) => y - 1)}
					>
						<ChevronLeft className="size-4" />
					</Button>
					<span className="text-sm font-semibold">{viewYear}</span>
					<Button
						variant="ghost"
						size="icon-sm"
						type="button"
						aria-label="Next year"
						onClick={() => setViewYear((y) => y + 1)}
					>
						<ChevronRight className="size-4" />
					</Button>
				</div>

				{/* Month grid */}
				<div className="grid grid-cols-3 gap-1">
					{MONTH_NAMES_EN.map((name, idx) => {
						const isSelected =
							parsed?.year === viewYear && parsed?.month === idx;
						const isDisabled = isMonthDisabled(viewYear, idx, min, max);
						return (
							<Button
								key={name}
								variant={isSelected ? "default" : "ghost"}
								size="sm"
								type="button"
								disabled={isDisabled}
								aria-pressed={isSelected}
								aria-label={`${MONTH_NAMES_FULL_EN[idx]} ${viewYear}`}
								onClick={() => handleSelect(idx)}
								className={cn("h-8 text-xs", isDisabled && "opacity-40")}
							>
								{name}
							</Button>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
}
