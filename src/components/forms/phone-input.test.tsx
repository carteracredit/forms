import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { PhoneInput } from "./phone-input";

// Mock LanguageProvider
vi.mock("@/components/LanguageProvider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
		language: "en",
	}),
}));

describe("PhoneInput", () => {
	afterEach(() => {
		cleanup();
	});

	it("should render phone input", () => {
		const onChange = vi.fn();
		const { container } = render(<PhoneInput onChange={onChange} />);

		expect(
			container.querySelector('input[placeholder="phone.placeholder"]'),
		).toBeInTheDocument();
	});

	it("should display country flag button", () => {
		const onChange = vi.fn();
		const { container } = render(<PhoneInput onChange={onChange} />);

		// Should have US flag by default
		expect(container).toHaveTextContent("🇺🇸");
	});

	it("should format phone number as user types", () => {
		const onChange = vi.fn();
		const { container } = render(<PhoneInput onChange={onChange} />);

		const input = container.querySelector(
			'input[placeholder="phone.placeholder"]',
		) as HTMLInputElement;
		fireEvent.change(input, { target: { value: "1234567890" } });

		expect(onChange).toHaveBeenCalledWith("+1 (123) 456-7890");
	});

	it("should handle partial phone numbers", () => {
		const onChange = vi.fn();
		const { container } = render(<PhoneInput onChange={onChange} />);

		const input = container.querySelector(
			'input[placeholder="phone.placeholder"]',
		) as HTMLInputElement;
		fireEvent.change(input, { target: { value: "123" } });

		expect(onChange).toHaveBeenCalledWith("+1 123");
	});

	it("should strip non-numeric characters", () => {
		const onChange = vi.fn();
		const { container } = render(<PhoneInput onChange={onChange} />);

		const input = container.querySelector(
			'input[placeholder="phone.placeholder"]',
		) as HTMLInputElement;
		fireEvent.change(input, { target: { value: "abc123def456" } });

		expect(onChange).toHaveBeenCalledWith("+1 (123) 456");
	});

	it("should limit to 10 digits", () => {
		const onChange = vi.fn();
		const { container } = render(<PhoneInput onChange={onChange} />);

		const input = container.querySelector(
			'input[placeholder="phone.placeholder"]',
		) as HTMLInputElement;
		fireEvent.change(input, { target: { value: "12345678901234" } });

		expect(onChange).toHaveBeenCalledWith("+1 (123) 456-7890");
	});

	it("should be disabled when disabled prop is true", () => {
		const onChange = vi.fn();
		const { container } = render(<PhoneInput onChange={onChange} disabled />);

		const input = container.querySelector(
			'input[placeholder="phone.placeholder"]',
		);
		expect(input).toBeDisabled();
	});

	it("should apply largeText styling when prop is true", () => {
		const onChange = vi.fn();
		const { container } = render(<PhoneInput onChange={onChange} largeText />);

		const input = container.querySelector(
			'input[placeholder="phone.placeholder"]',
		);
		expect(input).toHaveClass("text-base");
	});
});
