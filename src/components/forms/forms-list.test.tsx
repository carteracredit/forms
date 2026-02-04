import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { FormsList } from "./forms-list";

// Mock LanguageProvider
vi.mock("@/components/LanguageProvider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
		language: "en",
	}),
}));

// Mock form store
const mockForms = [
	{
		id: "form-1",
		name: "Contact Form",
		description: "A contact form for users",
		status: "published",
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
		status: "draft",
		currentVersion: 1,
		createdAt: "2024-01-03T00:00:00Z",
		updatedAt: "2024-01-04T00:00:00Z",
		tags: ["survey"],
		versions: [],
	},
];

vi.mock("@/lib/form-store", () => ({
	useFormStore: () => ({
		forms: mockForms,
		deleteForm: vi.fn(),
	}),
}));

describe("FormsList", () => {
	afterEach(() => {
		cleanup();
	});

	it("should render list of forms", () => {
		const onViewForm = vi.fn();
		const onEditForm = vi.fn();

		const { container } = render(
			<FormsList onViewForm={onViewForm} onEditForm={onEditForm} />,
		);

		expect(container).toHaveTextContent("Contact Form");
		expect(container).toHaveTextContent("Survey Form");
	});

	it("should render search input", () => {
		const onViewForm = vi.fn();
		const onEditForm = vi.fn();

		const { container } = render(
			<FormsList onViewForm={onViewForm} onEditForm={onEditForm} />,
		);

		const searchInput = container.querySelector(
			'input[placeholder="formsList.searchPlaceholder"]',
		);
		expect(searchInput).toBeInTheDocument();
	});

	it("should render filter buttons", () => {
		const onViewForm = vi.fn();
		const onEditForm = vi.fn();

		const { container } = render(
			<FormsList onViewForm={onViewForm} onEditForm={onEditForm} />,
		);

		expect(container).toHaveTextContent("status.all");
		expect(container).toHaveTextContent("status.published");
		expect(container).toHaveTextContent("status.draft");
	});

	it("should filter forms by search query", () => {
		const onViewForm = vi.fn();
		const onEditForm = vi.fn();

		const { container } = render(
			<FormsList onViewForm={onViewForm} onEditForm={onEditForm} />,
		);

		const searchInput = container.querySelector(
			'input[placeholder="formsList.searchPlaceholder"]',
		) as HTMLInputElement;
		fireEvent.change(searchInput, { target: { value: "Contact" } });

		expect(container).toHaveTextContent("Contact Form");
		expect(container).not.toHaveTextContent("Survey Form");
	});

	it("should filter forms by status", () => {
		const onViewForm = vi.fn();
		const onEditForm = vi.fn();

		const { container } = render(
			<FormsList onViewForm={onViewForm} onEditForm={onEditForm} />,
		);

		// Find the draft filter button (in the filter bar, not the status badge)
		const filterButtons = container.querySelectorAll("button");
		const draftButton = Array.from(filterButtons).find(
			(btn) =>
				btn.textContent === "status.draft" &&
				!btn.closest('[data-slot="card"]'),
		);
		fireEvent.click(draftButton!);

		expect(container).toHaveTextContent("Survey Form");
		expect(container).not.toHaveTextContent("Contact Form");
	});

	it("should display form descriptions", () => {
		const onViewForm = vi.fn();
		const onEditForm = vi.fn();

		const { container } = render(
			<FormsList onViewForm={onViewForm} onEditForm={onEditForm} />,
		);

		expect(container).toHaveTextContent("A contact form for users");
		expect(container).toHaveTextContent("Customer satisfaction survey");
	});

	it("should display form tags", () => {
		const onViewForm = vi.fn();
		const onEditForm = vi.fn();

		const { container } = render(
			<FormsList onViewForm={onViewForm} onEditForm={onEditForm} />,
		);

		expect(container).toHaveTextContent("contact");
		expect(container).toHaveTextContent("support");
	});

	it("should show empty state when no forms match filter", () => {
		const onViewForm = vi.fn();
		const onEditForm = vi.fn();

		const { container } = render(
			<FormsList onViewForm={onViewForm} onEditForm={onEditForm} />,
		);

		const searchInput = container.querySelector(
			'input[placeholder="formsList.searchPlaceholder"]',
		) as HTMLInputElement;
		fireEvent.change(searchInput, { target: { value: "nonexistent xyz" } });

		expect(container).toHaveTextContent("formsList.noFormsFound");
	});
});
