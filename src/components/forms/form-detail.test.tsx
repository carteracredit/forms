import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { FormDetail } from "./form-detail";

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
	}),
}));

vi.mock("./edit-form-info-dialog", () => ({
	EditFormInfoDialog: () => null,
}));

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

const mockStoreState = {
	selectedForm: mockForm,
	selectedVersion: mockForm.versions[0],
	setSelectedVersion: vi.fn(),
	setSelectedForm: vi.fn(),
	publishForm: vi.fn(),
	archiveForm: vi.fn(),
	refreshForm: vi.fn().mockResolvedValue(undefined),
};

vi.mock("@/lib/form-store", () => {
	const hook = Object.assign(() => mockStoreState, {
		getState: () => mockStoreState,
	});
	return { useFormStore: hook };
});

// FormDetail includes FieldShowcase (18 field cards + Radix Tabs); allow headroom on CI.
describe("FormDetail", { timeout: 20_000 }, () => {
	afterEach(() => {
		cleanup();
		mockPush.mockClear();
	});

	it("should render form name and description", async () => {
		const { container } = render(<FormDetail formId="form-1" />);

		await waitFor(() => {
			expect(container).toHaveTextContent("Test Form");
			expect(container).toHaveTextContent("A test form description");
		});
	});

	it("should navigate to list when back button is clicked", async () => {
		const { getByText } = render(<FormDetail formId="form-1" />);

		await waitFor(() => {
			expect(getByText("common.back")).toBeInTheDocument();
		});

		getByText("common.back").click();
		expect(mockPush).toHaveBeenCalledWith("/");
	});

	it("should navigate to editor when edit fields button is clicked", async () => {
		const { getByText } = render(<FormDetail formId="form-1" />);

		await waitFor(() => {
			expect(getByText("formDetail.editFields")).toBeInTheDocument();
		});

		getByText("formDetail.editFields").click();
		expect(mockPush).toHaveBeenCalledWith("/form-1/editor");
	});

	it("should display form fields", async () => {
		const { container } = render(<FormDetail formId="form-1" />);

		await waitFor(() => {
			expect(container).toHaveTextContent("Name");
			expect(container).toHaveTextContent("fieldTypes.text");
		});
	});

	it("should display version history section", async () => {
		const { container } = render(<FormDetail formId="form-1" />);

		await waitFor(() => {
			expect(container).toHaveTextContent("formDetail.versionHistory");
		});
	});

	it("should have Field Library tab", async () => {
		const { getByText } = render(<FormDetail formId="form-1" />);

		await waitFor(() => {
			expect(getByText("formDetail.fieldLibrary")).toBeInTheDocument();
		});
	});

	it("should render with fieldLibrary as initial tab when specified", async () => {
		const { container } = render(
			<FormDetail formId="form-1" initialTab="fieldLibrary" />,
		);

		await waitFor(() => {
			expect(container).toBeInTheDocument();
		});
	});

	it("should show Edit Info button", async () => {
		const { getByText } = render(<FormDetail formId="form-1" />);

		await waitFor(() => {
			expect(getByText("formDetail.editInfo")).toBeInTheDocument();
		});
	});

	it("should load form data on mount", async () => {
		render(<FormDetail formId="form-1" />);

		await waitFor(() => {
			expect(mockStoreState.refreshForm).toHaveBeenCalledWith("form-1");
		});
	});
});
