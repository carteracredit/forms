import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { FormsList } from "./forms-list";

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		refresh: vi.fn(),
	}),
	usePathname: () => "/",
	useSearchParams: () => new URLSearchParams(),
}));

// Mock LanguageProvider
vi.mock("@/components/LanguageProvider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
		language: "en",
	}),
}));

const mockDeleteForm = vi.fn();
const mockCloneForm = vi.fn();

const mockForms = [
	{
		id: "form-1",
		name: "Contact Form",
		description: "A contact form for users",
		status: "published" as const,
		currentVersion: 1,
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-02T00:00:00Z",
		tags: ["contact", "support"],
		versions: [],
	},
	{
		id: "form-2",
		name: "Survey Form",
		description: "Customer satisfaction survey",
		status: "draft" as const,
		currentVersion: 1,
		createdAt: "2024-01-03T00:00:00Z",
		updatedAt: "2024-01-04T00:00:00Z",
		tags: ["survey"],
		versions: [],
	},
];

// Mutable state so tests can override forms
let storeForms = mockForms;
let storeIsLoading = false;

vi.mock("@/lib/form-store", () => ({
	useFormStore: () => ({
		get forms() {
			return storeForms;
		},
		deleteForm: mockDeleteForm,
		cloneForm: mockCloneForm,
		get isLoading() {
			return storeIsLoading;
		},
	}),
}));

const defaultProps = {
	onViewForm: vi.fn(),
	onEditForm: vi.fn(),
	onCreateForm: vi.fn(),
};

describe("FormsList", () => {
	beforeEach(() => {
		storeForms = mockForms;
		storeIsLoading = false;
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it("should render list of forms", () => {
		const { container } = render(<FormsList {...defaultProps} />);

		expect(container).toHaveTextContent("Contact Form");
		expect(container).toHaveTextContent("Survey Form");
	});

	it("should render search input", () => {
		const { container } = render(<FormsList {...defaultProps} />);

		const searchInput = container.querySelector(
			'input[placeholder="formsList.searchPlaceholder"]',
		);
		expect(searchInput).toBeInTheDocument();
	});

	it("should render stats chips", () => {
		const { container } = render(<FormsList {...defaultProps} />);

		expect(container).toHaveTextContent("formsList.statsTotal");
		expect(container).toHaveTextContent("formsList.statsPublished");
		expect(container).toHaveTextContent("formsList.statsDraft");
		expect(container).toHaveTextContent("formsList.statsArchived");
	});

	it("should show correct total count in stats chips", () => {
		const { container } = render(<FormsList {...defaultProps} />);

		// The stats chip for Total shows the count: 2 forms total
		const statButtons = container.querySelectorAll("button");
		const totalChip = Array.from(statButtons).find((btn) =>
			btn.textContent?.includes("formsList.statsTotal"),
		);
		expect(totalChip?.textContent).toContain("2");
	});

	it("should filter forms by search query", () => {
		const { container } = render(<FormsList {...defaultProps} />);

		const searchInput = container.querySelector(
			'input[placeholder="formsList.searchPlaceholder"]',
		) as HTMLInputElement;
		fireEvent.change(searchInput, { target: { value: "Contact" } });

		expect(container).toHaveTextContent("Contact Form");
		expect(container).not.toHaveTextContent("Survey Form");
	});

	it("should filter forms by status using stats chips", () => {
		const { container } = render(<FormsList {...defaultProps} />);

		// Click on the "draft" stats chip
		const draftChip = Array.from(container.querySelectorAll("button")).find(
			(btn) => btn.textContent?.includes("formsList.statsDraft"),
		);
		fireEvent.click(draftChip!);

		expect(container).toHaveTextContent("Survey Form");
		expect(container).not.toHaveTextContent("Contact Form");
	});

	it("should display form names in the list", () => {
		const { container } = render(<FormsList {...defaultProps} />);

		expect(container).toHaveTextContent("Contact Form");
		expect(container).toHaveTextContent("Survey Form");
	});

	it("should display form tags", () => {
		const { container } = render(<FormsList {...defaultProps} />);

		expect(container).toHaveTextContent("contact");
		expect(container).toHaveTextContent("support");
	});

	it("should show empty state with filter message when no forms match search", () => {
		const { container } = render(<FormsList {...defaultProps} />);

		const searchInput = container.querySelector(
			'input[placeholder="formsList.searchPlaceholder"]',
		) as HTMLInputElement;
		fireEvent.change(searchInput, { target: { value: "nonexistent xyz" } });

		expect(container).toHaveTextContent("formsList.noFormsFound");
	});

	it("should not show create button in empty state when filtered", () => {
		const { container } = render(<FormsList {...defaultProps} />);

		const searchInput = container.querySelector(
			'input[placeholder="formsList.searchPlaceholder"]',
		) as HTMLInputElement;
		fireEvent.change(searchInput, { target: { value: "nonexistent xyz" } });

		// When filtered, the create button should NOT appear in the empty state
		const createButtons = Array.from(
			container.querySelectorAll("button"),
		).filter((btn) => btn.textContent?.includes("formsList.createForm"));
		expect(createButtons).toHaveLength(0);
	});

	it("should show empty state with create button when no forms exist and no filters", () => {
		storeForms = [];

		const onCreateForm = vi.fn();
		const { container } = render(
			<FormsList {...defaultProps} onCreateForm={onCreateForm} />,
		);

		expect(container).toHaveTextContent("formsList.noFormsYet");

		const createButton = Array.from(container.querySelectorAll("button")).find(
			(btn) => btn.textContent?.includes("formsList.createForm"),
		);
		expect(createButton).toBeInTheDocument();

		fireEvent.click(createButton!);
		expect(onCreateForm).toHaveBeenCalledOnce();
	});

	it("should show skeleton while loading with no cached forms", () => {
		storeForms = [];
		storeIsLoading = true;

		const { container } = render(<FormsList {...defaultProps} />);

		// Skeleton renders table header skeleton rows
		const animatedDivs = container.querySelectorAll(".animate-pulse");
		expect(animatedDivs.length).toBeGreaterThan(0);
	});

	it("should show result count", () => {
		const { container } = render(<FormsList {...defaultProps} />);

		// 2 forms = "2 formsList.results"
		expect(container).toHaveTextContent("2");
		expect(container).toHaveTextContent("formsList.results");
	});
});
