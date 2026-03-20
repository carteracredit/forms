import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	render,
	waitFor,
	screen,
	within,
	fireEvent,
} from "@testing-library/react";
import { FormEditor } from "./form-editor";
import type { FormField } from "@/lib/types/form";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: mockPush,
	}),
}));

vi.mock("@/components/LanguageProvider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
		language: "en",
		getFieldLabel: (en: string) => en,
		getFieldPlaceholder: (en?: string) => en || "",
	}),
}));

vi.mock("@/components/forms/form-field-renderer", () => ({
	FormFieldRenderer: ({ field }: { field: { label: string } }) => (
		<div data-testid="field-renderer">{field.label}</div>
	),
}));

vi.mock("@/components/SessionControls", () => ({
	SessionControls: () => null,
}));

vi.mock("sonner", () => ({
	toast: {
		info: vi.fn(),
		error: vi.fn(),
		success: vi.fn(),
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

const mockStoreState = {
	selectedForm: mockForm,
	saveFieldsDraft: vi.fn(),
	publishForm: vi.fn(),
	updateEditingFields: vi.fn(),
	cancelEditing: vi.fn(),
	startEditing: vi.fn(),
	setSelectedForm: vi.fn(),
	refreshForm: vi.fn().mockResolvedValue(undefined),
	isEditing: false,
	editingFields: [] as FormField[],
};

vi.mock("@/lib/form-store", () => {
	const hook = Object.assign(() => mockStoreState, {
		getState: () => mockStoreState,
	});
	return { useFormStore: hook };
});

describe("FormEditor", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockStoreState.isEditing = false;
		mockStoreState.editingFields = [];
		mockStoreState.selectedForm = mockForm;
	});

	it("should render form editor with form name", async () => {
		const { container } = render(<FormEditor formId="form-1" />);

		await waitFor(() => {
			expect(container).toHaveTextContent("Test Form");
			expect(container).toHaveTextContent("formEditor.editFields");
		});
	});

	it("should navigate directly when cancel is clicked with no unsaved changes", async () => {
		const { container } = render(<FormEditor formId="form-1" />);

		await waitFor(() => {
			expect(container).toHaveTextContent("common.cancel");
		});

		const buttons = container.querySelectorAll("button");
		const cancelButton = Array.from(buttons).find(
			(btn) => btn.textContent === "common.cancel",
		);

		if (cancelButton) {
			cancelButton.click();
			expect(mockPush).toHaveBeenCalledWith("/form-1");
		}
	});

	it("should show leave confirmation dialog when cancel is clicked with unsaved changes", async () => {
		mockStoreState.isEditing = true;
		mockStoreState.editingFields = [
			{ id: "f1", type: "text", label: "Existing Field", required: true },
			{ id: "f2", type: "email", label: "New Email", required: false },
		];

		const { container } = render(<FormEditor formId="form-1" />);

		await waitFor(() => {
			expect(container).toHaveTextContent("formEditor.editFields");
		});

		const buttons = container.querySelectorAll("button");
		const cancelButton = Array.from(buttons).find(
			(btn) => btn.textContent === "common.cancel",
		);

		expect(cancelButton).toBeDefined();
		cancelButton!.click();

		await waitFor(() => {
			expect(screen.getByText("formEditor.leaveTitle")).toBeInTheDocument();
			expect(screen.getByText("formEditor.leaveMessage")).toBeInTheDocument();
		});

		expect(mockPush).not.toHaveBeenCalled();
	});

	it("should stay on editor when clicking stay in leave dialog", async () => {
		mockStoreState.isEditing = true;
		mockStoreState.editingFields = [
			{ id: "f1", type: "text", label: "Existing Field", required: true },
			{ id: "f2", type: "email", label: "New Email", required: false },
		];

		const { container } = render(<FormEditor formId="form-1" />);

		await waitFor(() => {
			expect(container).toHaveTextContent("formEditor.editFields");
		});

		const cancelButton = Array.from(container.querySelectorAll("button")).find(
			(btn) => btn.textContent === "common.cancel",
		);
		cancelButton!.click();

		let dialog: HTMLElement;
		await waitFor(() => {
			dialog = screen.getByRole("dialog");
			expect(
				within(dialog).getByText("formEditor.leaveTitle"),
			).toBeInTheDocument();
		});

		fireEvent.click(within(dialog!).getByText("formEditor.leaveCancel"));

		expect(mockPush).not.toHaveBeenCalled();
		expect(mockStoreState.cancelEditing).not.toHaveBeenCalled();
		expect(container).toHaveTextContent("formEditor.editFields");
	});

	it("should navigate away when clicking leave in leave dialog", async () => {
		mockStoreState.isEditing = true;
		mockStoreState.editingFields = [
			{ id: "f1", type: "text", label: "Existing Field", required: true },
			{ id: "f2", type: "email", label: "New Email", required: false },
		];

		const { container } = render(<FormEditor formId="form-1" />);

		await waitFor(() => {
			expect(container).toHaveTextContent("formEditor.editFields");
		});

		const cancelButton = Array.from(container.querySelectorAll("button")).find(
			(btn) => btn.textContent === "common.cancel",
		);
		cancelButton!.click();

		let dialog: HTMLElement;
		await waitFor(() => {
			dialog = screen.getByRole("dialog");
			expect(
				within(dialog).getByText("formEditor.leaveTitle"),
			).toBeInTheDocument();
		});

		fireEvent.click(within(dialog!).getByText("formEditor.leaveConfirm"));

		expect(mockStoreState.cancelEditing).toHaveBeenCalled();
		expect(mockPush).toHaveBeenCalledWith("/form-1");
	});

	it("should show existing fields", async () => {
		const { container } = render(<FormEditor formId="form-1" />);

		await waitFor(() => {
			expect(container).toHaveTextContent("Existing Field");
		});
	});

	it("should render action buttons", async () => {
		const { container } = render(<FormEditor formId="form-1" />);

		await waitFor(() => {
			expect(container).toHaveTextContent("formEditor.saveDraft");
			expect(container).toHaveTextContent("formEditor.publish");
			expect(container).toHaveTextContent("formEditor.addField");
		});
	});

	it("should load form and start editing on mount", async () => {
		render(<FormEditor formId="form-1" />);

		await waitFor(() => {
			expect(mockStoreState.refreshForm).toHaveBeenCalledWith("form-1");
			expect(mockStoreState.startEditing).toHaveBeenCalled();
		});
	});

	it("should sync editing fields and navigate to preview with from=editor param", async () => {
		const { container } = render(<FormEditor formId="form-1" />);

		await waitFor(() => {
			expect(container).toHaveTextContent("formEditor.editFields");
		});

		const buttons = container.querySelectorAll("button");
		const previewButton = Array.from(buttons).find((btn) =>
			btn.textContent?.includes("formEditor.fullPreview"),
		);

		if (previewButton) {
			previewButton.click();
			expect(mockStoreState.updateEditingFields).toHaveBeenCalled();
			expect(mockPush).toHaveBeenCalledWith("/preview/form-1?from=editor");
		}
	});
});
