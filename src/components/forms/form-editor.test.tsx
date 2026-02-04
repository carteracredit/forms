import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { FormEditor } from "./form-editor";

// Mock next/navigation
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
	}),
}));

// Mock LanguageProvider
vi.mock("@/components/LanguageProvider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
		language: "en",
		getFieldLabel: (en: string) => en,
		getFieldPlaceholder: (en?: string) => en || "",
	}),
}));

// Mock FormFieldRenderer
vi.mock("@/components/forms/form-field-renderer", () => ({
	FormFieldRenderer: ({ field }: { field: { label: string } }) => (
		<div data-testid="field-renderer">{field.label}</div>
	),
}));

const mockForm = {
	id: "form-1",
	name: "Test Form",
	description: "A test form",
	status: "draft",
	currentVersion: 1,
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z",
	tags: [],
	versions: [
		{
			id: "v1",
			version: 1,
			createdAt: "2024-01-01T00:00:00Z",
			createdBy: "Test User",
			fields: [
				{ id: "f1", type: "text", label: "Existing Field", required: true },
			],
			schema: { input: {}, output: {} },
		},
	],
};

vi.mock("@/lib/form-store", () => ({
	useFormStore: () => ({
		selectedForm: mockForm,
		saveFormVersion: vi.fn(),
	}),
}));

describe("FormEditor", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render form editor with form name", () => {
		const onBack = vi.fn();
		const onSave = vi.fn();

		const { container } = render(
			<FormEditor onBack={onBack} onSave={onSave} />,
		);

		expect(container).toHaveTextContent("Test Form");
		expect(container).toHaveTextContent("formEditor.editForm");
	});

	it("should call onBack when cancel button is clicked", () => {
		const onBack = vi.fn();
		const onSave = vi.fn();

		const { container } = render(
			<FormEditor onBack={onBack} onSave={onSave} />,
		);

		// Find the cancel button
		const buttons = container.querySelectorAll("button");
		const cancelButton = Array.from(buttons).find(
			(btn) => btn.textContent === "common.cancel",
		);

		if (cancelButton) {
			fireEvent.click(cancelButton);
			expect(onBack).toHaveBeenCalled();
		}
	});

	it("should show existing fields", () => {
		const onBack = vi.fn();
		const onSave = vi.fn();

		const { container } = render(
			<FormEditor onBack={onBack} onSave={onSave} />,
		);

		expect(container).toHaveTextContent("Existing Field");
	});

	it("should render action buttons", () => {
		const onBack = vi.fn();
		const onSave = vi.fn();

		const { container } = render(
			<FormEditor onBack={onBack} onSave={onSave} />,
		);

		expect(container).toHaveTextContent("formEditor.saveVersion");
		expect(container).toHaveTextContent("formEditor.addField");
	});
});
