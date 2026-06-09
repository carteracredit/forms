import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
	render,
	screen,
	fireEvent,
	waitFor,
	cleanup,
} from "@testing-library/react";
import { JSONModal } from "./json-modal";
import type { FormExport } from "@/lib/forms/form-export-schema";

vi.mock("@/components/LanguageProvider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
		language: "en",
	}),
}));

// Mock the dynamic imports from @/lib/forms/io
vi.mock("@/lib/forms/io", () => ({
	parseFormImport: vi.fn(),
	downloadFormJson: vi.fn(),
}));

// Radix Dialog renders in a portal; make it render inline for tests
vi.mock("@/components/ui/dialog", () => ({
	Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
		open ? <div data-testid="dialog">{children}</div> : null,
	DialogContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DialogHeader: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DialogTitle: ({ children }: { children: React.ReactNode }) => (
		<h2>{children}</h2>
	),
}));

vi.mock("@/components/ui/radio-group", () => ({
	RadioGroup: ({
		value,
		onValueChange,
		children,
	}: {
		value: string;
		onValueChange: (v: string) => void;
		children: React.ReactNode;
	}) => (
		<div data-testid="radio-group" data-value={value}>
			<button
				data-testid="radio-new"
				onClick={() => onValueChange("new")}
				aria-pressed={value === "new"}
			>
				new
			</button>
			<button
				data-testid="radio-replace"
				onClick={() => onValueChange("replace")}
				aria-pressed={value === "replace"}
			>
				replace
			</button>
			{children}
		</div>
	),
	RadioGroupItem: ({ value }: { value: string }) => (
		<input type="radio" value={value} readOnly />
	),
}));

vi.mock("@/components/ui/button", () => ({
	Button: ({
		children,
		onClick,
		disabled,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
		disabled?: boolean;
	}) => (
		<button onClick={onClick} disabled={disabled}>
			{children}
		</button>
	),
}));

vi.mock("@/components/ui/textarea", () => ({
	Textarea: ({
		value,
		onChange,
		readOnly,
		placeholder,
	}: {
		value: string;
		onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
		readOnly?: boolean;
		placeholder?: string;
	}) => (
		<textarea
			data-testid="json-textarea"
			value={value}
			onChange={onChange}
			readOnly={readOnly}
			placeholder={placeholder}
		/>
	),
}));

vi.mock("@/components/ui/label", () => ({
	Label: ({ children }: { children: React.ReactNode }) => (
		<label>{children}</label>
	),
}));

const sampleExport: FormExport = {
	metadata: {
		version: "1.0",
		kind: "form",
		exportedAt: "2025-01-01T00:00:00Z",
	},
	form: { name: "My Form", description: "desc", tags: [] },
	fields: [],
};

const baseProps = {
	open: true,
	onClose: vi.fn(),
	onImportNew: vi.fn(),
};

beforeEach(() => {
	vi.clearAllMocks();
});

afterEach(() => {
	cleanup();
});

describe("JSONModal – export mode", () => {
	it("renders the export title and JSON in textarea", () => {
		render(
			<JSONModal {...baseProps} mode="export" exportData={sampleExport} />,
		);

		expect(screen.getByTestId("dialog")).toBeInTheDocument();
		const textarea = screen.getByTestId("json-textarea");
		expect(textarea).toHaveAttribute("readonly");
		expect(textarea).toHaveValue(JSON.stringify(sampleExport, null, 2));
	});

	it("calls downloadFormJson when download button is clicked", async () => {
		const { downloadFormJson } = await import("@/lib/forms/io");
		render(
			<JSONModal {...baseProps} mode="export" exportData={sampleExport} />,
		);

		fireEvent.click(screen.getByText("jsonModal.download"));

		await waitFor(() => {
			expect(downloadFormJson).toHaveBeenCalledWith(sampleExport);
		});
	});

	it("does not call downloadFormJson when exportData is undefined", async () => {
		const { downloadFormJson } = await import("@/lib/forms/io");
		render(<JSONModal {...baseProps} mode="export" exportData={undefined} />);

		fireEvent.click(screen.getByText("jsonModal.download"));

		await waitFor(() => {
			expect(downloadFormJson).not.toHaveBeenCalled();
		});
	});

	it("does not render when open is false", () => {
		render(
			<JSONModal
				{...baseProps}
				open={false}
				mode="export"
				exportData={sampleExport}
			/>,
		);
		expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
	});

	it("calls onClose when cancel button is clicked", () => {
		render(
			<JSONModal {...baseProps} mode="export" exportData={sampleExport} />,
		);
		fireEvent.click(screen.getByText("jsonModal.cancel"));
		expect(baseProps.onClose).toHaveBeenCalledOnce();
	});
});

describe("JSONModal – import mode (new only)", () => {
	it("renders import title and editable textarea", () => {
		render(<JSONModal {...baseProps} mode="import" />);

		const textarea = screen.getByTestId("json-textarea");
		expect(textarea).not.toHaveAttribute("readonly");
	});

	it("does not render radio group when allowReplace is false", () => {
		render(<JSONModal {...baseProps} mode="import" allowReplace={false} />);
		expect(screen.queryByTestId("radio-group")).not.toBeInTheDocument();
	});

	it("calls onImportNew with parsed data on import", async () => {
		const { parseFormImport } = await import("@/lib/forms/io");
		vi.mocked(parseFormImport).mockReturnValue(sampleExport);

		render(<JSONModal {...baseProps} mode="import" />);

		fireEvent.change(screen.getByTestId("json-textarea"), {
			target: { value: '{"form":{"name":"X"},"fields":[]}' },
		});

		fireEvent.click(screen.getByText("jsonModal.import"));

		await waitFor(() => {
			expect(parseFormImport).toHaveBeenCalled();
			expect(baseProps.onImportNew).toHaveBeenCalledWith(sampleExport);
		});
	});

	it("displays error message when parseFormImport throws", async () => {
		const { parseFormImport } = await import("@/lib/forms/io");
		vi.mocked(parseFormImport).mockImplementation(() => {
			throw new Error("Invalid format: bad JSON");
		});

		render(<JSONModal {...baseProps} mode="import" />);

		fireEvent.change(screen.getByTestId("json-textarea"), {
			target: { value: "bad json" },
		});
		fireEvent.click(screen.getByText("jsonModal.import"));

		await waitFor(() => {
			expect(screen.getByText("Invalid format: bad JSON")).toBeInTheDocument();
		});
	});

	it("shows file upload button in import mode", () => {
		render(<JSONModal {...baseProps} mode="import" />);
		expect(screen.getByText("jsonModal.uploadFile")).toBeInTheDocument();
	});
});

describe("JSONModal – import mode with replace", () => {
	it("renders radio group when allowReplace is true", () => {
		render(
			<JSONModal
				{...baseProps}
				mode="import"
				allowReplace
				onImportReplace={vi.fn()}
			/>,
		);
		expect(screen.getByTestId("radio-group")).toBeInTheDocument();
	});

	it("switches to replace mode when radio is clicked", () => {
		render(
			<JSONModal
				{...baseProps}
				mode="import"
				allowReplace
				onImportReplace={vi.fn()}
			/>,
		);

		fireEvent.click(screen.getByTestId("radio-replace"));
		expect(
			screen.getByText("jsonModal.modeReplaceWarning"),
		).toBeInTheDocument();
	});

	it("calls onImportReplace when replace mode is active", async () => {
		const { parseFormImport } = await import("@/lib/forms/io");
		vi.mocked(parseFormImport).mockReturnValue(sampleExport);
		const onImportReplace = vi.fn();

		render(
			<JSONModal
				{...baseProps}
				mode="import"
				allowReplace
				onImportReplace={onImportReplace}
			/>,
		);

		fireEvent.click(screen.getByTestId("radio-replace"));

		fireEvent.change(screen.getByTestId("json-textarea"), {
			target: { value: '{"form":{"name":"X"},"fields":[]}' },
		});

		fireEvent.click(screen.getByText("jsonModal.import"));

		await waitFor(() => {
			expect(onImportReplace).toHaveBeenCalledWith(sampleExport);
			expect(baseProps.onImportNew).not.toHaveBeenCalled();
		});
	});

	it("calls onImportNew when replace mode selected but no onImportReplace provided", async () => {
		const { parseFormImport } = await import("@/lib/forms/io");
		vi.mocked(parseFormImport).mockReturnValue(sampleExport);

		render(<JSONModal {...baseProps} mode="import" allowReplace />);

		fireEvent.click(screen.getByTestId("radio-replace"));

		fireEvent.change(screen.getByTestId("json-textarea"), {
			target: { value: '{"form":{"name":"X"},"fields":[]}' },
		});

		fireEvent.click(screen.getByText("jsonModal.import"));

		await waitFor(() => {
			expect(baseProps.onImportNew).toHaveBeenCalledWith(sampleExport);
		});
	});
});

describe("JSONModal – file upload", () => {
	it("reads file content and sets it in the textarea", async () => {
		const fileContent = JSON.stringify(sampleExport);

		// Mock FileReader so readAsText synchronously triggers onload
		const originalFileReader = global.FileReader;
		class MockFileReader {
			onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
			readAsText(_file: Blob) {
				this.onload?.({
					target: { result: fileContent },
				} as unknown as ProgressEvent<FileReader>);
			}
		}
		global.FileReader = MockFileReader as unknown as typeof FileReader;

		render(<JSONModal {...baseProps} mode="import" />);

		const file = new File([fileContent], "form.json", {
			type: "application/json",
		});
		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		fireEvent.change(input, { target: { files: [file] } });

		await waitFor(() => {
			expect(screen.getByTestId("json-textarea")).toHaveValue(fileContent);
		});

		global.FileReader = originalFileReader;
	});

	it("does nothing when no file is selected", () => {
		render(<JSONModal {...baseProps} mode="import" />);
		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;

		// Fire change with no files — should not throw or update textarea
		fireEvent.change(input, { target: { files: [] } });

		expect(screen.getByTestId("json-textarea")).toHaveValue("");
	});
});
