import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, screen, cleanup } from "@testing-library/react";
import { CreateFormDialog } from "./create-form-dialog";
import type { CreateFormPayload } from "./create-form-dialog";

vi.mock("@/components/LanguageProvider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
		language: "en",
		getFieldLabel: (en: string) => en,
	}),
}));

describe("CreateFormDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
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

		const cancelButton = screen.getByRole("button", { name: "common.cancel" });
		fireEvent.click(cancelButton);

		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it("should call onCreateForm with EN-only payload when ES fields are empty", () => {
		const onCreateForm = vi.fn();

		render(
			<CreateFormDialog
				open={true}
				onOpenChange={vi.fn()}
				onCreateForm={onCreateForm}
			/>,
		);

		fireEvent.change(
			screen.getByPlaceholderText("createForm.formNamePlaceholder"),
			{
				target: { value: "My Form" },
			},
		);
		fireEvent.change(
			screen.getByPlaceholderText("createForm.descriptionPlaceholder"),
			{
				target: { value: "A description" },
			},
		);

		const createButton = screen.getByRole("button", {
			name: "createForm.title",
		});
		fireEvent.click(createButton);

		expect(onCreateForm).toHaveBeenCalledWith({
			name: "My Form",
			nameEs: undefined,
			description: "A description",
			descriptionEs: undefined,
		} satisfies CreateFormPayload);
	});

	it("should call onCreateForm with both EN and ES when filled", () => {
		const onCreateForm = vi.fn();

		render(
			<CreateFormDialog
				open={true}
				onOpenChange={vi.fn()}
				onCreateForm={onCreateForm}
			/>,
		);

		fireEvent.change(
			screen.getByPlaceholderText("createForm.formNamePlaceholder"),
			{
				target: { value: "My Form" },
			},
		);
		fireEvent.change(
			screen.getByPlaceholderText("createForm.formNameEsPlaceholder"),
			{
				target: { value: "Mi Formulario" },
			},
		);
		fireEvent.change(
			screen.getByPlaceholderText("createForm.descriptionPlaceholder"),
			{
				target: { value: "A description" },
			},
		);
		fireEvent.change(
			screen.getByPlaceholderText("createForm.descriptionEsPlaceholder"),
			{
				target: { value: "Una descripción" },
			},
		);

		const createButton = screen.getByRole("button", {
			name: "createForm.title",
		});
		fireEvent.click(createButton);

		expect(onCreateForm).toHaveBeenCalledWith({
			name: "My Form",
			nameEs: "Mi Formulario",
			description: "A description",
			descriptionEs: "Una descripción",
		} satisfies CreateFormPayload);
	});

	it("should disable create button when EN name is empty", () => {
		render(
			<CreateFormDialog
				open={true}
				onOpenChange={vi.fn()}
				onCreateForm={vi.fn()}
			/>,
		);

		const createButton = screen.getByRole("button", {
			name: "createForm.title",
		});
		expect(createButton).toBeDisabled();
	});

	it("should not disable create button when ES name is empty but EN is filled", () => {
		render(
			<CreateFormDialog
				open={true}
				onOpenChange={vi.fn()}
				onCreateForm={vi.fn()}
			/>,
		);

		fireEvent.change(
			screen.getByPlaceholderText("createForm.formNamePlaceholder"),
			{
				target: { value: "My Form" },
			},
		);

		const createButton = screen.getByRole("button", {
			name: "createForm.title",
		});
		expect(createButton).toBeEnabled();
	});

	it("should treat whitespace-only ES fields as undefined", () => {
		const onCreateForm = vi.fn();

		render(
			<CreateFormDialog
				open={true}
				onOpenChange={vi.fn()}
				onCreateForm={onCreateForm}
			/>,
		);

		fireEvent.change(
			screen.getByPlaceholderText("createForm.formNamePlaceholder"),
			{
				target: { value: "My Form" },
			},
		);
		fireEvent.change(
			screen.getByPlaceholderText("createForm.formNameEsPlaceholder"),
			{
				target: { value: "   " },
			},
		);

		const createButton = screen.getByRole("button", {
			name: "createForm.title",
		});
		fireEvent.click(createButton);

		expect(onCreateForm).toHaveBeenCalledWith(
			expect.objectContaining({ nameEs: undefined }),
		);
	});
});
