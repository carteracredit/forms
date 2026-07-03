import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MonthPicker } from "./month-picker";

afterEach(() => {
	cleanup();
});

function getTrigger(): HTMLButtonElement {
	return screen.getByTestId("month-picker-trigger") as HTMLButtonElement;
}

describe("MonthPicker", () => {
	it("renders placeholder when no value is set", () => {
		render(<MonthPicker placeholder="Pick a month" />);
		expect(screen.getByText("Pick a month")).toBeInTheDocument();
	});

	it("displays selected month and year in trigger button", () => {
		render(<MonthPicker value="2024-03" />);
		expect(screen.getByText("March 2024")).toBeInTheDocument();
	});

	it("opens popover and shows month grid on trigger click", () => {
		render(<MonthPicker value="2024-03" />);
		fireEvent.click(getTrigger());
		expect(screen.getByText("Jan")).toBeInTheDocument();
		expect(screen.getByText("Dec")).toBeInTheDocument();
	});

	it("shows the year in the popover header after opening", () => {
		render(<MonthPicker value="2024-03" />);
		fireEvent.click(getTrigger());
		const yearSpans = screen.getAllByText("2024");
		expect(yearSpans.length).toBeGreaterThanOrEqual(1);
	});

	it("navigates to next year when next button is clicked", () => {
		render(<MonthPicker value="2024-03" />);
		fireEvent.click(getTrigger());
		fireEvent.click(screen.getByRole("button", { name: /next year/i }));
		expect(screen.getByText("2025")).toBeInTheDocument();
	});

	it("navigates to previous year when prev button is clicked", () => {
		render(<MonthPicker value="2024-03" />);
		fireEvent.click(getTrigger());
		fireEvent.click(screen.getByRole("button", { name: /previous year/i }));
		expect(screen.getByText("2023")).toBeInTheDocument();
	});

	it("calls onChange with YYYY-MM when a month is selected", () => {
		const onChange = vi.fn();
		render(<MonthPicker value="2024-01" onChange={onChange} />);
		fireEvent.click(getTrigger());
		// Click on March in the grid (aria-label="March 2024")
		fireEvent.click(screen.getByRole("button", { name: "March 2024" }));
		expect(onChange).toHaveBeenCalledWith("2024-03");
	});

	it("disables months before min", () => {
		render(<MonthPicker value="2024-06" min="2024-03" />);
		fireEvent.click(getTrigger());
		const janBtn = screen.getByRole("button", { name: "January 2024" });
		expect(janBtn).toBeDisabled();
	});

	it("does not disable months within range", () => {
		render(<MonthPicker value="2024-06" min="2024-03" max="2024-09" />);
		fireEvent.click(getTrigger());
		const aprBtn = screen.getByRole("button", { name: "April 2024" });
		expect(aprBtn).not.toBeDisabled();
	});

	it("disables months after max", () => {
		render(<MonthPicker value="2024-06" max="2024-09" />);
		fireEvent.click(getTrigger());
		const decBtn = screen.getByRole("button", { name: "December 2024" });
		expect(decBtn).toBeDisabled();
	});

	it("renders trigger button as disabled when disabled prop is set", () => {
		render(<MonthPicker value="2024-03" disabled />);
		expect(getTrigger()).toBeDisabled();
	});
});
