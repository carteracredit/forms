import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { EditFormInfoDialog } from "./edit-form-info-dialog";

// Mock LanguageProvider
vi.mock("@/components/LanguageProvider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
		language: "en",
	}),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
	},
}));

const mockUpdateForm = vi.fn();

const mockForm = {
	id: "form-1",
	name: "Test Form",
	description: "Test description",
	status: "draft" as const,
	currentVersion: 1,
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z",
	tags: ["tag1", "tag2"],
	versions: [],
};

vi.mock("@/lib/form-store", () => ({
	useFormStore: () => ({
		selectedForm: mockForm,
		updateForm: mockUpdateForm,
	}),
}));

describe("EditFormInfoDialog", () => {
	beforeEach(() => {
		mockUpdateForm.mockReset();
	});

	afterEach(() => {
		cleanup();
	});

	it("should render with current form data when open", () => {
		const onOpenChange = vi.fn();
		const { getByDisplayValue } = render(
			<EditFormInfoDialog open={true} onOpenChange={onOpenChange} />,
		);

		expect(getByDisplayValue("Test Form")).toBeInTheDocument();
		expect(getByDisplayValue("Test description")).toBeInTheDocument();
		expect(getByDisplayValue("tag1, tag2")).toBeInTheDocument();
	});

	it("should disable Save button when no changes are made", () => {
		const onOpenChange = vi.fn();
		const { getByRole } = render(
			<EditFormInfoDialog open={true} onOpenChange={onOpenChange} />,
		);

		const saveButton = getByRole("button", { name: "common.save" });
		expect(saveButton).toBeDisabled();
	});

	it("should enable Save button when name changes", () => {
		const onOpenChange = vi.fn();
		const { getByDisplayValue, getByRole } = render(
			<EditFormInfoDialog open={true} onOpenChange={onOpenChange} />,
		);

		const nameInput = getByDisplayValue("Test Form");
		fireEvent.change(nameInput, { target: { value: "Updated Form Name" } });

		const saveButton = getByRole("button", { name: "common.save" });
		expect(saveButton).not.toBeDisabled();
	});

	it("should disable Save button when name is cleared", () => {
		const onOpenChange = vi.fn();
		const { getByDisplayValue, getByRole } = render(
			<EditFormInfoDialog open={true} onOpenChange={onOpenChange} />,
		);

		const nameInput = getByDisplayValue("Test Form");
		fireEvent.change(nameInput, { target: { value: "" } });

		const saveButton = getByRole("button", { name: "common.save" });
		expect(saveButton).toBeDisabled();
	});

	it("should call updateForm with updated values on save", async () => {
		mockUpdateForm.mockResolvedValue(undefined);
		const onOpenChange = vi.fn();
		const { getByDisplayValue, getByRole } = render(
			<EditFormInfoDialog open={true} onOpenChange={onOpenChange} />,
		);

		const nameInput = getByDisplayValue("Test Form");
		fireEvent.change(nameInput, { target: { value: "New Form Name" } });

		const saveButton = getByRole("button", { name: "common.save" });
		fireEvent.click(saveButton);

		await waitFor(() => {
			expect(mockUpdateForm).toHaveBeenCalledWith(
				"form-1",
				expect.objectContaining({ name: "New Form Name" }),
			);
		});
	});

	it("should call onOpenChange(false) on cancel", () => {
		const onOpenChange = vi.fn();
		const { getByRole } = render(
			<EditFormInfoDialog open={true} onOpenChange={onOpenChange} />,
		);

		const cancelButton = getByRole("button", { name: "common.cancel" });
		fireEvent.click(cancelButton);

		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it("should not render when closed", () => {
		const onOpenChange = vi.fn();
		const { queryByRole } = render(
			<EditFormInfoDialog open={false} onOpenChange={onOpenChange} />,
		);

		expect(queryByRole("dialog")).not.toBeInTheDocument();
	});
});
