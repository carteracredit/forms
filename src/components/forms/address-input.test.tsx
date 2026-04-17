import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { AddressInput } from "./address-input";

// Mock LanguageProvider
vi.mock("@/components/LanguageProvider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
		language: "en",
	}),
}));

describe("AddressInput", () => {
	afterEach(() => {
		cleanup();
	});

	it("should render all address fields", () => {
		const onChange = vi.fn();
		const { container } = render(<AddressInput onChange={onChange} />);

		expect(container).toHaveTextContent("address.street");
		expect(container).toHaveTextContent("address.city");
		expect(container).toHaveTextContent("address.state");
		expect(container).toHaveTextContent("address.zip");
		expect(container).toHaveTextContent("address.country");
	});

	it("should render autocomplete toggle when showAutocompleteToggle is true", () => {
		const onChange = vi.fn();
		const { container } = render(
			<AddressInput onChange={onChange} showAutocompleteToggle />,
		);

		expect(container).toHaveTextContent("address.autocomplete");
	});

	it("should hide autocomplete toggle when showAutocompleteToggle is false", () => {
		const onChange = vi.fn();
		const { container } = render(
			<AddressInput onChange={onChange} showAutocompleteToggle={false} />,
		);

		expect(container).not.toHaveTextContent("address.autocomplete");
	});

	it("should call onChange when street field changes", () => {
		const onChange = vi.fn();
		const { container } = render(<AddressInput onChange={onChange} />);

		const streetInput = container.querySelector(
			'input[placeholder="address.streetPlaceholder"]',
		) as HTMLInputElement;
		fireEvent.change(streetInput, { target: { value: "123 Main St" } });

		expect(onChange).toHaveBeenCalledWith(
			expect.objectContaining({
				street: "123 Main St",
			}),
		);
	});

	it("should call onChange when city field changes", () => {
		const onChange = vi.fn();
		const { container } = render(<AddressInput onChange={onChange} />);

		const cityInput = container.querySelector(
			'input[placeholder="address.cityPlaceholder"]',
		) as HTMLInputElement;
		fireEvent.change(cityInput, { target: { value: "San Francisco" } });

		expect(onChange).toHaveBeenCalledWith(
			expect.objectContaining({
				city: "San Francisco",
			}),
		);
	});

	it("should be disabled when disabled prop is true", () => {
		const onChange = vi.fn();
		const { container } = render(<AddressInput onChange={onChange} disabled />);

		const streetInput = container.querySelector(
			'input[placeholder="address.streetPlaceholder"]',
		);
		expect(streetInput).toBeDisabled();
	});

	it("should show search input when autocomplete is enabled", async () => {
		const onChange = vi.fn();
		const { container } = render(
			<AddressInput onChange={onChange} showAutocompleteToggle />,
		);

		const switchElement = container.querySelector(
			'button[role="switch"]',
		) as HTMLElement;
		fireEvent.click(switchElement);

		await waitFor(() => {
			expect(
				container.querySelector('input[placeholder*="common.search"]'),
			).toBeInTheDocument();
		});
	});
});
