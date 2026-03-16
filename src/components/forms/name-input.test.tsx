import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { NameInput } from "./name-input";

vi.mock("@/components/LanguageProvider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
		language: "en",
	}),
}));

describe("NameInput", () => {
	afterEach(() => {
		cleanup();
	});

	it("should render firstName and lastName fields always", () => {
		const onChange = vi.fn();
		const { container } = render(<NameInput onChange={onChange} />);

		expect(
			container.querySelector('input[placeholder="name.firstNamePlaceholder"]'),
		).toBeInTheDocument();
		expect(
			container.querySelector('input[placeholder="name.lastNamePlaceholder"]'),
		).toBeInTheDocument();
	});

	it("should not render middleName field when includeMiddleName is false", () => {
		const onChange = vi.fn();
		const { container } = render(
			<NameInput onChange={onChange} includeMiddleName={false} />,
		);

		expect(
			container.querySelector(
				'input[placeholder="name.middleNamePlaceholder"]',
			),
		).not.toBeInTheDocument();
	});

	it("should render middleName field when includeMiddleName is true", () => {
		const onChange = vi.fn();
		const { container } = render(
			<NameInput onChange={onChange} includeMiddleName />,
		);

		expect(
			container.querySelector(
				'input[placeholder="name.middleNamePlaceholder"]',
			),
		).toBeInTheDocument();
	});

	it("should call onChange with NameValue when firstName changes", () => {
		const onChange = vi.fn();
		const { container } = render(<NameInput onChange={onChange} />);

		const firstNameInput = container.querySelector(
			'input[placeholder="name.firstNamePlaceholder"]',
		) as HTMLInputElement;
		fireEvent.change(firstNameInput, { target: { value: "John" } });

		expect(onChange).toHaveBeenCalledWith(
			expect.objectContaining({ firstName: "John" }),
		);
	});

	it("should call onChange with NameValue when lastName changes", () => {
		const onChange = vi.fn();
		const { container } = render(<NameInput onChange={onChange} />);

		const lastNameInput = container.querySelector(
			'input[placeholder="name.lastNamePlaceholder"]',
		) as HTMLInputElement;
		fireEvent.change(lastNameInput, { target: { value: "Doe" } });

		expect(onChange).toHaveBeenCalledWith(
			expect.objectContaining({ lastName: "Doe" }),
		);
	});

	it("should call onChange with middleName when includeMiddleName is enabled", () => {
		const onChange = vi.fn();
		const { container } = render(
			<NameInput onChange={onChange} includeMiddleName />,
		);

		const middleNameInput = container.querySelector(
			'input[placeholder="name.middleNamePlaceholder"]',
		) as HTMLInputElement;
		fireEvent.change(middleNameInput, { target: { value: "M." } });

		expect(onChange).toHaveBeenCalledWith(
			expect.objectContaining({ middleName: "M." }),
		);
	});

	it("should parse a string value with two parts into firstName and lastName", () => {
		const onChange = vi.fn();
		const { container } = render(
			<NameInput value="John Doe" onChange={onChange} />,
		);

		const firstNameInput = container.querySelector(
			'input[placeholder="name.firstNamePlaceholder"]',
		) as HTMLInputElement;
		const lastNameInput = container.querySelector(
			'input[placeholder="name.lastNamePlaceholder"]',
		) as HTMLInputElement;

		expect(firstNameInput.value).toBe("John");
		expect(lastNameInput.value).toBe("Doe");
	});

	it("should parse a NameValue object as initial value", () => {
		const onChange = vi.fn();
		const { container } = render(
			<NameInput
				value={{ firstName: "Jane", middleName: "A.", lastName: "Smith" }}
				onChange={onChange}
				includeMiddleName
			/>,
		);

		const firstNameInput = container.querySelector(
			'input[placeholder="name.firstNamePlaceholder"]',
		) as HTMLInputElement;
		const lastNameInput = container.querySelector(
			'input[placeholder="name.lastNamePlaceholder"]',
		) as HTMLInputElement;
		const middleNameInput = container.querySelector(
			'input[placeholder="name.middleNamePlaceholder"]',
		) as HTMLInputElement;

		expect(firstNameInput.value).toBe("Jane");
		expect(lastNameInput.value).toBe("Smith");
		expect(middleNameInput.value).toBe("A.");
	});

	it("should disable inputs when disabled prop is true", () => {
		const onChange = vi.fn();
		const { container } = render(
			<NameInput onChange={onChange} disabled includeMiddleName />,
		);

		const inputs = container.querySelectorAll("input");
		inputs.forEach((input) => {
			expect(input).toBeDisabled();
		});
	});

	it("should show optional label text for middleName", () => {
		const onChange = vi.fn();
		const { container } = render(
			<NameInput onChange={onChange} includeMiddleName />,
		);

		expect(container).toHaveTextContent("name.middleName");
		expect(container).toHaveTextContent("common.optional");
	});
});
