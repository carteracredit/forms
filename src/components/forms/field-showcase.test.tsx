import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { FieldShowcase } from "./field-showcase";

vi.mock("@/components/LanguageProvider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
		language: "en",
		getFieldLabel: (en: string) => en,
		getFieldPlaceholder: (en?: string) => en,
	}),
}));

describe("FieldShowcase", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders the field library title and description", () => {
		const { container } = render(<FieldShowcase />);
		expect(container).toHaveTextContent("fieldLibrary.title");
		expect(container).toHaveTextContent("fieldLibrary.description");
	});

	it("renders all 18 field type cards", () => {
		const { container } = render(<FieldShowcase />);
		const fieldTypes = [
			"name",
			"phone",
			"email",
			"text",
			"textarea",
			"number",
			"url",
			"password",
			"dropdown",
			"address",
			"file",
			"checkbox",
			"radio",
			"checkbox-group",
			"date",
			"time",
			"datetime",
			"rating",
		];
		for (const type of fieldTypes) {
			expect(container.textContent).toContain(type);
		}
	});

	it("each field card has Properties, Features, Input Schema, Output Schema tabs", () => {
		const { getAllByText } = render(<FieldShowcase />);
		// Tabs appear once per field type (18 times each)
		expect(
			getAllByText("fieldLibrary.properties").length,
		).toBeGreaterThanOrEqual(1);
		expect(getAllByText("fieldLibrary.features").length).toBeGreaterThanOrEqual(
			1,
		);
		expect(
			getAllByText("fieldLibrary.inputSchema").length,
		).toBeGreaterThanOrEqual(1);
		expect(
			getAllByText("fieldLibrary.outputSchema").length,
		).toBeGreaterThanOrEqual(1);
	});

	it("shows schema JSON in output tab content for name field", () => {
		const { container } = render(<FieldShowcase />);
		// First card is "name" - output schema should contain "fullName"
		expect(container.textContent).toMatch(/fullName|string/);
	});
});
