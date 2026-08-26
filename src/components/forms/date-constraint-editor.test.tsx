import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import {
	DateConstraintEditor,
	type DateConstraintValue,
} from "./date-constraint-editor";

vi.mock("@/components/LanguageProvider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
		language: "en",
	}),
}));

vi.mock("@/components/ui/month-picker", () => ({
	MonthPicker: ({
		value,
		onChange,
	}: {
		value?: string;
		onChange?: (v: string) => void;
	}) => (
		<input
			data-testid="month-picker"
			value={value || ""}
			onChange={(e) => onChange?.(e.target.value)}
		/>
	),
}));

const relativeDate: DateConstraintValue = {
	minMode: "relative",
	maxMode: "relative",
	minFixed: "",
	maxFixed: "",
	minOffset: { direction: "past", years: 2 },
	maxOffset: { direction: "future", years: 1 },
};

describe("DateConstraintEditor", () => {
	it("shows year/month/day offset inputs for date fields", () => {
		const { container } = render(
			<DateConstraintEditor
				kind="date"
				value={relativeDate}
				onChange={vi.fn()}
			/>,
		);

		expect(container).toHaveTextContent("fieldProperties.offsetYears");
		expect(container).toHaveTextContent("fieldProperties.offsetDays");
		expect(container).not.toHaveTextContent("fieldProperties.offsetHours");
	});

	it("shows hours and minutes for datetime fields", () => {
		const { container } = render(
			<DateConstraintEditor
				kind="datetime"
				value={{
					...relativeDate,
					minOffset: { direction: "past", days: 15, hours: 2 },
				}}
				onChange={vi.fn()}
			/>,
		);

		expect(container).toHaveTextContent("fieldProperties.offsetHours");
		expect(container).toHaveTextContent("fieldProperties.offsetMinutes");
	});

	it("hides days for month fields and uses MonthPicker in fixed mode", () => {
		const { container } = render(
			<DateConstraintEditor
				kind="month"
				value={{
					minMode: "fixed",
					maxMode: "relative",
					minFixed: "2024-01",
					maxFixed: "",
					minOffset: { direction: "past" },
					maxOffset: { direction: "future", months: 3 },
				}}
				onChange={vi.fn()}
			/>,
		);

		expect(
			container.querySelector('[data-testid="month-picker"]'),
		).toBeTruthy();
		expect(container).not.toHaveTextContent("fieldProperties.offsetDays");
		expect(container).toHaveTextContent("fieldProperties.offsetMonths");
	});

	it("uses datetime-local for a fixed datetime bound", () => {
		const { container } = render(
			<DateConstraintEditor
				kind="datetime"
				value={{
					minMode: "fixed",
					maxMode: "none",
					minFixed: "2026-08-25T10:00",
					maxFixed: "",
					minOffset: { direction: "past" },
					maxOffset: { direction: "future" },
				}}
				onChange={vi.fn()}
			/>,
		);

		expect(
			container.querySelector('input[type="datetime-local"]'),
		).toBeInTheDocument();
	});

	it("shows the range invalid warning", () => {
		const { container } = render(
			<DateConstraintEditor
				kind="date"
				value={relativeDate}
				onChange={vi.fn()}
				rangeInvalid
			/>,
		);

		expect(container).toHaveTextContent("fieldProperties.rangeInvalid");
	});

	it("notifies onChange when an offset year changes", () => {
		const onChange = vi.fn();
		const { container } = render(
			<DateConstraintEditor
				kind="date"
				value={relativeDate}
				onChange={onChange}
			/>,
		);

		const yearInputs = container.querySelectorAll('input[type="number"]');
		fireEvent.change(yearInputs[0]!, { target: { value: "3" } });
		expect(onChange).toHaveBeenCalledWith(
			expect.objectContaining({
				minOffset: expect.objectContaining({ years: 3 }),
			}),
		);
	});
});
