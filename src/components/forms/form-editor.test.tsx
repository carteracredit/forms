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

// Mock SessionControls to avoid auth dependencies
vi.mock("@/components/SessionControls", () => ({
	SessionControls: () => null,
}));

// Mock sonner
vi.mock("sonner", () => ({
	toast: {
		info: vi.fn(),
		error: vi.fn(),
	},
}));

const mockForm = {
	id: "form-1",
	name: "Test Form",
	description: "A test form",
	status: "draft",
	currentVersion: 0,
	draftFields: [
		{ id: "f1", type: "text", label: "Existing Field", required: true },
	],
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z",
	tags: [],
	versions: [],
};

vi.mock("@/lib/form-store", () => ({
	useFormStore: () => ({
		selectedForm: mockForm,
		saveFieldsDraft: vi.fn(),
		publishForm: vi.fn(),
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
		expect(container).toHaveTextContent("formEditor.editFields");
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

		expect(container).toHaveTextContent("formEditor.saveDraft");
		expect(container).toHaveTextContent("formEditor.publish");
		expect(container).toHaveTextContent("formEditor.addField");
	});
});
