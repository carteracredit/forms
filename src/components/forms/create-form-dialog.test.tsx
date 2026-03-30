import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { CreateFormDialog } from "./create-form-dialog";

// Mock LanguageProvider
vi.mock("@/components/LanguageProvider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
		language: "en",
	}),
}));

describe("CreateFormDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should not render dialog content when closed", () => {
		const onOpenChange = vi.fn();
		const onCreateForm = vi.fn();

		render(
			<CreateFormDialog
				open={false}
				onOpenChange={onOpenChange}
				onCreateForm={onCreateForm}
			/>,
		);

		// Dialog content should not be present when closed
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("should render dialog when open", () => {
		const onOpenChange = vi.fn();
		const onCreateForm = vi.fn();

		render(
			<CreateFormDialog
				open={true}
				onOpenChange={onOpenChange}
				onCreateForm={onCreateForm}
			/>,
		);

		// Check dialog is present (radix uses role="dialog")
		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});

	it("should call onOpenChange when cancel button is clicked", () => {
		const onOpenChange = vi.fn();
		const onCreateForm = vi.fn();

		render(
			<CreateFormDialog
				open={true}
				onOpenChange={onOpenChange}
				onCreateForm={onCreateForm}
			/>,
		);

		// Find cancel button
		const cancelButton = screen.getByRole("button", { name: "common.cancel" });
		fireEvent.click(cancelButton);

		expect(onOpenChange).toHaveBeenCalledWith(false);
	});
});
