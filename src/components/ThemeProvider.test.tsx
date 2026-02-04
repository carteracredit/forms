import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { ThemeProvider } from "./ThemeProvider";

// Mock next-themes
vi.mock("next-themes", () => ({
	ThemeProvider: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="mock-theme-provider">{children}</div>
	),
}));

describe("ThemeProvider", () => {
	it("should render children", () => {
		const { container } = render(
			<ThemeProvider>
				<div data-testid="child">Child Content</div>
			</ThemeProvider>,
		);

		expect(container).toHaveTextContent("Child Content");
	});
});
