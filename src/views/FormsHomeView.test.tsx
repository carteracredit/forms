import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { FormsHomeView } from "./FormsHomeView";

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
		setLanguage: vi.fn(),
		getFieldLabel: (en: string) => en,
	}),
}));

// Mock useAuthSession
vi.mock("@/lib/auth/useAuthSession", () => ({
	useAuthSession: () => ({
		data: {
			user: {
				id: "user-1",
				name: "Test User",
				email: "test@example.com",
				role: "admin",
			},
			session: { id: "session-1" },
		},
		isLoading: false,
		isAuthenticated: true,
	}),
}));

// Mock auth config
vi.mock("@/lib/auth/config", () => ({
	getAuthAppUrl: () => "https://auth.example.com",
}));

// Mock @janovix/blocks
vi.mock("@janovix/blocks", () => ({
	LanguageSwitcher: () => (
		<button data-testid="language-switcher">Language</button>
	),
	ThemeSwitcher: () => <button data-testid="theme-switcher">Theme</button>,
}));

// Mock form components
vi.mock("@/components/forms/forms-list", () => ({
	FormsList: ({
		onViewForm,
		onEditForm,
	}: {
		onViewForm: (id: string) => void;
		onEditForm: (id: string) => void;
	}) => (
		<div data-testid="forms-list">
			<button onClick={() => onViewForm("form-1")} data-testid="view-btn">
				View Form
			</button>
			<button onClick={() => onEditForm("form-1")} data-testid="edit-btn">
				Edit Form
			</button>
		</div>
	),
}));

vi.mock("@/components/forms/form-detail", () => ({
	FormDetail: ({
		onBack,
		onEdit,
	}: {
		onBack: () => void;
		onEdit: () => void;
	}) => (
		<div data-testid="form-detail">
			<button onClick={onBack} data-testid="back-btn">
				Back
			</button>
			<button onClick={onEdit} data-testid="edit-detail-btn">
				Edit
			</button>
		</div>
	),
}));

vi.mock("@/components/forms/form-editor", () => ({
	FormEditor: ({
		onBack,
		onSave,
	}: {
		onBack: () => void;
		onSave: () => void;
	}) => (
		<div data-testid="form-editor">
			<button onClick={onBack} data-testid="cancel-btn">
				Cancel
			</button>
			<button onClick={onSave} data-testid="save-btn">
				Save
			</button>
		</div>
	),
}));

vi.mock("@/components/forms/create-form-dialog", () => ({
	CreateFormDialog: ({
		open,
		onOpenChange,
		onCreateForm,
	}: {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		onCreateForm: (name: string, description: string) => void;
	}) =>
		open ? (
			<div data-testid="create-dialog">
				<button
					onClick={() => onCreateForm("New Form", "Description")}
					data-testid="create-btn"
				>
					Create
				</button>
				<button
					onClick={() => onOpenChange(false)}
					data-testid="cancel-create-btn"
				>
					Cancel
				</button>
			</div>
		) : null,
}));

// Mock form store
vi.mock("@/lib/form-store", () => ({
	useFormStore: Object.assign(
		() => ({
			setSelectedForm: vi.fn(),
			createForm: vi.fn(),
			startEditing: vi.fn(),
			cancelEditing: vi.fn(),
		}),
		{
			getState: () => ({
				forms: [
					{
						id: "form-1",
						name: "Test Form",
						versions: [{ id: "v1", version: 1, fields: [] }],
						currentVersion: 1,
					},
				],
				selectedForm: {
					id: "form-1",
					name: "Test Form",
					versions: [{ id: "v1", version: 1, fields: [] }],
					currentVersion: 1,
				},
			}),
		},
	),
}));

describe("FormsHomeView", () => {
	afterEach(() => {
		cleanup();
	});

	it("should render header and forms list", () => {
		const { container } = render(<FormsHomeView />);

		expect(
			container.querySelector('[data-testid="forms-list"]'),
		).toBeInTheDocument();
		expect(
			container.querySelector('[data-testid="language-switcher"]'),
		).toBeInTheDocument();
		expect(
			container.querySelector('[data-testid="theme-switcher"]'),
		).toBeInTheDocument();
	});

	it("should navigate to form detail when view is clicked", async () => {
		const { container } = render(<FormsHomeView />);

		const viewBtn = container.querySelector(
			'[data-testid="view-btn"]',
		) as HTMLElement;
		fireEvent.click(viewBtn);

		await waitFor(() => {
			expect(
				container.querySelector('[data-testid="form-detail"]'),
			).toBeInTheDocument();
		});
	});

	it("should navigate to editor when edit is clicked", async () => {
		const { container } = render(<FormsHomeView />);

		const editBtn = container.querySelector(
			'[data-testid="edit-btn"]',
		) as HTMLElement;
		fireEvent.click(editBtn);

		await waitFor(() => {
			expect(
				container.querySelector('[data-testid="form-editor"]'),
			).toBeInTheDocument();
		});
	});

	it("should return to list when back is clicked from detail", async () => {
		const { container } = render(<FormsHomeView />);

		// Go to detail
		const viewBtn = container.querySelector(
			'[data-testid="view-btn"]',
		) as HTMLElement;
		fireEvent.click(viewBtn);

		await waitFor(() => {
			expect(
				container.querySelector('[data-testid="form-detail"]'),
			).toBeInTheDocument();
		});

		// Go back
		const backBtn = container.querySelector(
			'[data-testid="back-btn"]',
		) as HTMLElement;
		fireEvent.click(backBtn);

		await waitFor(() => {
			expect(
				container.querySelector('[data-testid="forms-list"]'),
			).toBeInTheDocument();
		});
	});

	it("should open create dialog when create button is clicked", async () => {
		const { container, getByText } = render(<FormsHomeView />);

		const createBtn = getByText("formsList.createForm");
		fireEvent.click(createBtn);

		await waitFor(() => {
			expect(
				container.querySelector('[data-testid="create-dialog"]'),
			).toBeInTheDocument();
		});
	});
});
