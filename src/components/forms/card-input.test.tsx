import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { CardInput } from "./card-input";

vi.mock("@/components/LanguageProvider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
		language: "en",
	}),
}));

describe("CardInput", () => {
	beforeEach(() => {
		vi.stubGlobal(
			"fetch",
			vi.fn(
				async () =>
					new Response(
						JSON.stringify({
							success: true,
							result: {
								tokenId: "tok_test",
								brand: "visa",
								last4: "4242",
								expMonth: 12,
								expYear: 2030,
								masked: "•••• •••• •••• 4242",
							},
						}),
						{ status: 201, headers: { "content-type": "application/json" } },
					),
			),
		);
	});

	afterEach(() => {
		cleanup();
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("shows validation error when brand is not accepted", () => {
		const onChange = vi.fn();
		const { container } = render(
			<CardInput onChange={onChange} acceptedBrands={["amex"]} />,
		);

		const inputs = container.querySelectorAll("input");
		const panInput = inputs[0] as HTMLInputElement;
		fireEvent.change(panInput, {
			target: { value: "4242424242424242" },
		});

		expect(container.textContent).toContain("card.invalidNumber");
	});

	it("masks PAN when blurred after entering digits", () => {
		const onChange = vi.fn();
		const { container } = render(<CardInput onChange={onChange} />);

		const panInput = container.querySelectorAll("input")[0] as HTMLInputElement;
		fireEvent.change(panInput, { target: { value: "4242424242424242" } });
		fireEvent.focus(panInput);
		expect(panInput.value).toContain("4242");

		fireEvent.blur(panInput);
		expect(panInput.value).toContain("••••");
		expect(panInput.value).toContain("4242");
	});

	it("calls tokenize endpoint with valid card data", async () => {
		const onChange = vi.fn();
		const { container } = render(<CardInput onChange={onChange} />);

		const inputs = container.querySelectorAll("input");
		fireEvent.change(inputs[0], {
			target: { value: "4242424242424242" },
		});
		fireEvent.change(inputs[1], { target: { value: "12/30" } });
		fireEvent.change(inputs[2], { target: { value: "123" } });

		const btn = container.querySelector('button[type="button"]');
		expect(btn).toBeTruthy();
		fireEvent.click(btn!);

		await waitFor(() => {
			expect(onChange).toHaveBeenCalledWith(
				expect.objectContaining({
					tokenId: "tok_test",
					last4: "4242",
				}),
			);
		});

		const fetchMock = global.fetch as ReturnType<typeof vi.fn>;
		expect(fetchMock).toHaveBeenCalledWith(
			"/api/cards/tokenize",
			expect.objectContaining({
				method: "POST",
			}),
		);
	});
});
