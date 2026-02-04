import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { FormFieldRenderer } from "./form-field-renderer";
import type { FormField } from "@/lib/types/form";

// Mock LanguageProvider
vi.mock("@/components/LanguageProvider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
		language: "en",
		getFieldLabel: (en: string) => en,
		getFieldPlaceholder: (en?: string) => en || "",
	}),
}));

// Mock PhoneInput
vi.mock("@/components/forms/phone-input", () => ({
	PhoneInput: ({
		value,
		onChange,
		placeholder,
	}: {
		value: string;
		onChange: (v: string) => void;
		placeholder: string;
	}) => (
		<input
			data-testid="phone-input"
			value={value || ""}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
		/>
	),
}));

// Mock AddressInput
vi.mock("@/components/forms/address-input", () => ({
	AddressInput: ({
		value,
		onChange,
	}: {
		value: unknown;
		onChange: (v: unknown) => void;
	}) => (
		<input
			data-testid="address-input"
			value={typeof value === "string" ? value : ""}
			onChange={(e) => onChange(e.target.value)}
		/>
	),
}));

describe("FormFieldRenderer", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const createField = (overrides: Partial<FormField> = {}): FormField => ({
		id: "test-field",
		type: "text",
		label: "Test Field",
		required: false,
		...overrides,
	});

	it("should render text input", () => {
		const onChange = vi.fn();
		const field = createField({ type: "text" });

		const { container } = render(
			<FormFieldRenderer field={field} value="" onChange={onChange} />,
		);

		expect(container.querySelector("input")).toBeInTheDocument();
	});

	it("should call onChange when text input changes", () => {
		const onChange = vi.fn();
		const field = createField({ type: "text" });

		const { container } = render(
			<FormFieldRenderer field={field} value="" onChange={onChange} />,
		);

		const input = container.querySelector("input");
		fireEvent.change(input!, { target: { value: "new value" } });
		expect(onChange).toHaveBeenCalledWith("test-field", "new value");
	});

	it("should render email input", () => {
		const onChange = vi.fn();
		const field = createField({ type: "email" });

		const { container } = render(
			<FormFieldRenderer field={field} value="" onChange={onChange} />,
		);

		expect(container.querySelector('input[type="email"]')).toBeInTheDocument();
	});

	it("should render number input", () => {
		const onChange = vi.fn();
		const field = createField({ type: "number" });

		const { container } = render(
			<FormFieldRenderer field={field} value="" onChange={onChange} />,
		);

		expect(container.querySelector('input[type="number"]')).toBeInTheDocument();
	});

	it("should render checkbox", () => {
		const onChange = vi.fn();
		const field = createField({ type: "checkbox" });

		const { container } = render(
			<FormFieldRenderer field={field} value={false} onChange={onChange} />,
		);

		expect(container.querySelector('[role="checkbox"]')).toBeInTheDocument();
	});

	it("should render radio buttons", () => {
		const onChange = vi.fn();
		const field = createField({
			type: "radio",
			options: ["Option 1", "Option 2"],
		});

		const { container } = render(
			<FormFieldRenderer field={field} value="" onChange={onChange} />,
		);

		expect(container.querySelectorAll('[role="radio"]')).toHaveLength(2);
	});

	it("should render dropdown", () => {
		const onChange = vi.fn();
		const field = createField({
			type: "dropdown",
			options: ["Option 1", "Option 2"],
		});

		const { container } = render(
			<FormFieldRenderer field={field} value="" onChange={onChange} />,
		);

		expect(container.querySelector('[role="combobox"]')).toBeInTheDocument();
	});

	it("should render date input", () => {
		const onChange = vi.fn();
		const field = createField({ type: "date" });

		const { container } = render(
			<FormFieldRenderer field={field} value="" onChange={onChange} />,
		);

		expect(container.querySelector('input[type="date"]')).toBeInTheDocument();
	});

	it("should render phone input", () => {
		const onChange = vi.fn();
		const field = createField({ type: "phone" });

		const { container } = render(
			<FormFieldRenderer field={field} value="" onChange={onChange} />,
		);

		expect(
			container.querySelector('[data-testid="phone-input"]'),
		).toBeInTheDocument();
	});

	it("should render address input", () => {
		const onChange = vi.fn();
		const field = createField({ type: "address" });

		const { container } = render(
			<FormFieldRenderer
				field={field}
				value=""
				onChange={onChange}
				compact={false}
			/>,
		);

		expect(
			container.querySelector('[data-testid="address-input"]'),
		).toBeInTheDocument();
	});

	it("should render rating stars", () => {
		const onChange = vi.fn();
		const field = createField({
			type: "rating",
			properties: { maxRating: 5 },
		});

		const { container } = render(
			<FormFieldRenderer field={field} value={0} onChange={onChange} />,
		);

		expect(container.querySelectorAll("button")).toHaveLength(5);
	});

	it("should display required indicator", () => {
		const onChange = vi.fn();
		const field = createField({ type: "text", required: true });

		const { container } = render(
			<FormFieldRenderer field={field} value="" onChange={onChange} />,
		);

		expect(container).toHaveTextContent("*");
	});

	it("should return null for unknown field type", () => {
		const onChange = vi.fn();
		const field = createField({ type: "unknown" as FormField["type"] });

		const { container } = render(
			<FormFieldRenderer field={field} value="" onChange={onChange} />,
		);

		expect(container.firstChild).toBeNull();
	});
});
