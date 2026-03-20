import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { FormDetail } from "./form-detail";

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
	}),
}));

// Mock EditFormInfoDialog to avoid deep render chain
vi.mock("./edit-form-info-dialog", () => ({
	EditFormInfoDialog: () => null,
}));

// Mock SessionControls to avoid auth dependencies
vi.mock("@/components/SessionControls", () => ({
	SessionControls: () => null,
}));

const mockForm = {
	id: "form-1",
	name: "Test Form",
	description: "A test form description",
	status: "published",
	currentVersion: 1,
	draftFields: [{ id: "f1", type: "text", label: "Name", required: true }],
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-15T00:00:00Z",
	tags: ["test"],
	versions: [
		{
			id: "v1",
			version: 1,
			createdAt: "2024-01-01T00:00:00Z",
			createdBy: "User One",
			changelog: "Initial version",
			fields: [{ id: "f1", type: "text", label: "Name", required: true }],
			schema: { input: {}, output: {} },
		},
	],
};

vi.mock("@/lib/form-store", () => ({
	useFormStore: () => ({
		selectedForm: mockForm,
		selectedVersion: mockForm.versions[0],
		setSelectedVersion: vi.fn(),
		publishForm: vi.fn(),
		archiveForm: vi.fn(),
	}),
}));

// FormDetail includes FieldShowcase (18 field cards + Radix Tabs); allow headroom on CI.
describe("FormDetail", { timeout: 20_000 }, () => {
	afterEach(() => {
		cleanup();
	});

	it("should render form name and description", () => {
		const onBack = vi.fn();
		const onEdit = vi.fn();

		const { container } = render(
			<FormDetail onBack={onBack} onEdit={onEdit} />,
		);

		expect(container).toHaveTextContent("Test Form");
		expect(container).toHaveTextContent("A test form description");
	});

	it("should call onBack when back button is clicked", () => {
		const onBack = vi.fn();
		const onEdit = vi.fn();

		const { getByText } = render(
			<FormDetail onBack={onBack} onEdit={onEdit} />,
		);

		const backButton = getByText("common.back");
		fireEvent.click(backButton);

		expect(onBack).toHaveBeenCalled();
	});

	it("should call onEdit when edit fields button is clicked", () => {
		const onBack = vi.fn();
		const onEdit = vi.fn();

		const { getByText } = render(
			<FormDetail onBack={onBack} onEdit={onEdit} />,
		);

		const editButton = getByText("formDetail.editFields");
		fireEvent.click(editButton);

		expect(onEdit).toHaveBeenCalled();
	});

	it("should display form fields", () => {
		const onBack = vi.fn();
		const onEdit = vi.fn();

		const { container } = render(
			<FormDetail onBack={onBack} onEdit={onEdit} />,
		);

		expect(container).toHaveTextContent("Name");
		expect(container).toHaveTextContent("fieldTypes.text");
	});

	it("should display version history section", () => {
		const onBack = vi.fn();
		const onEdit = vi.fn();

		const { container } = render(
			<FormDetail onBack={onBack} onEdit={onEdit} />,
		);

		expect(container).toHaveTextContent("formDetail.versionHistory");
	});

	it("should have Field Library tab", () => {
		const onBack = vi.fn();
		const onEdit = vi.fn();

		const { getByText } = render(
			<FormDetail onBack={onBack} onEdit={onEdit} />,
		);

		const fieldLibraryTab = getByText("formDetail.fieldLibrary");
		expect(fieldLibraryTab).toBeInTheDocument();
	});

	it("should render with fieldLibrary as initial tab when specified", () => {
		const onBack = vi.fn();
		const onEdit = vi.fn();

		const { container } = render(
			<FormDetail onBack={onBack} onEdit={onEdit} initialTab="fieldLibrary" />,
		);

		expect(container).toBeInTheDocument();
	});

	it("should show Edit Info button", () => {
		const onBack = vi.fn();
		const onEdit = vi.fn();

		const { getByText } = render(
			<FormDetail onBack={onBack} onEdit={onEdit} />,
		);

		expect(getByText("formDetail.editInfo")).toBeInTheDocument();
	});
});
