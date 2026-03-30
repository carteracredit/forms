import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { FormsHomeView } from "./FormsHomeView";

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
		setLanguage: vi.fn(),
		getFieldLabel: (en: string) => en,
	}),
}));

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

vi.mock("@/lib/auth/config", () => ({
	getAuthAppUrl: () => "https://auth.example.com",
	getAuthServiceUrl: () => "https://auth-svc.example.com",
}));

vi.mock("@/lib/auth/authClient", () => ({
	authClient: {
		signOut: vi.fn().mockResolvedValue(undefined),
	},
}));

vi.mock("@/lib/auth/actions", () => ({
	logout: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/components/SessionControls", () => ({
	SessionControls: () => (
		<div data-testid="session-controls">
			<button data-testid="language-switcher">Language</button>
			<button data-testid="theme-switcher">Theme</button>
		</div>
	),
}));

vi.mock("next/image", () => ({
	default: (props: { alt: string }) => <img {...props} />,
}));

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

vi.mock("@/lib/form-store", () => ({
	useFormStore: Object.assign(
		() => ({
			forms: [
				{
					id: "form-1",
					name: "Test Form",
					versions: [{ id: "v1", version: 1, fields: [] }],
					currentVersion: 1,
				},
			],
			createForm: vi.fn().mockResolvedValue({
				id: "new-form",
				name: "New Form",
				versions: [{ id: "v1", version: 1, fields: [] }],
				currentVersion: 1,
			}),
			fetchForms: vi.fn().mockResolvedValue(undefined),
			isLoading: false,
			error: null,
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
				refreshForm: vi.fn().mockResolvedValue(undefined),
				setSelectedForm: vi.fn(),
			}),
		},
	),
}));

describe("FormsHomeView", () => {
	afterEach(() => {
		cleanup();
		mockPush.mockClear();
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

	it("should navigate to form detail route when view is clicked", () => {
		const { container } = render(<FormsHomeView />);

		const viewBtn = container.querySelector(
			'[data-testid="view-btn"]',
		) as HTMLElement;
		fireEvent.click(viewBtn);

		expect(mockPush).toHaveBeenCalledWith("/form-1");
	});

	it("should navigate to editor route when edit is clicked", () => {
		const { container } = render(<FormsHomeView />);

		const editBtn = container.querySelector(
			'[data-testid="edit-btn"]',
		) as HTMLElement;
		fireEvent.click(editBtn);

		expect(mockPush).toHaveBeenCalledWith("/form-1/editor");
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

	it("should navigate to detail with tab param after creating a form", async () => {
		const { container, getByText } = render(<FormsHomeView />);

		fireEvent.click(getByText("formsList.createForm"));

		await waitFor(() => {
			expect(
				container.querySelector('[data-testid="create-dialog"]'),
			).toBeInTheDocument();
		});

		const createBtn = container.querySelector(
			'[data-testid="create-btn"]',
		) as HTMLElement;
		fireEvent.click(createBtn);

		await waitFor(() => {
			expect(mockPush).toHaveBeenCalledWith("/new-form?tab=fieldLibrary");
		});
	});
});
