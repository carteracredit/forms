import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { SessionControls } from "./SessionControls";

vi.mock("@/components/LanguageProvider", () => ({
	useLanguage: () => ({
		language: "en",
		setLanguage: vi.fn(),
		t: (key: string) => key,
	}),
}));

vi.mock("@/lib/auth/useAuthSession", () => ({
	useAuthSession: () => ({
		data: {
			user: {
				id: "user-1",
				name: "John Doe",
				email: "john@example.com",
				image: null,
			},
		},
	}),
}));

vi.mock("@/lib/auth/config", () => ({
	getAuthAppUrl: () => "https://auth.example.com",
}));

vi.mock("@/lib/auth/actions", () => ({
	logout: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next-themes", () => ({
	useTheme: () => ({
		theme: "light",
		setTheme: vi.fn(),
	}),
}));

describe("SessionControls", () => {
	it("should render without crashing", () => {
		const { container } = render(<SessionControls />);
		expect(container).toBeTruthy();
	});

	it("should apply custom className to wrapper", () => {
		const { container } = render(<SessionControls className="custom-class" />);
		expect(container.firstChild).toHaveClass("custom-class");
	});

	it("should render at least 3 trigger buttons (language, theme, user)", () => {
		const { container } = render(<SessionControls />);
		const buttons = container.querySelectorAll("button");
		expect(buttons.length).toBeGreaterThanOrEqual(3);
	});

	it("should show current language abbreviation in language button", () => {
		const { getAllByText } = render(<SessionControls />);
		// The language abbreviation appears in the trigger button
		const enElements = getAllByText("EN");
		expect(enElements.length).toBeGreaterThanOrEqual(1);
	});

	it("should show theme icon button with aria-label", () => {
		const { container } = render(<SessionControls />);
		const themeButton = container.querySelector('[aria-label="Theme"]');
		expect(themeButton).toBeInTheDocument();
	});

	it("should show avatar button when user is logged in", () => {
		const { container } = render(<SessionControls />);
		// avatar is a rounded-full button
		const avatarButton = container.querySelector(
			'button.rounded-full, button[class*="rounded-full"]',
		);
		expect(avatarButton).toBeInTheDocument();
	});
});
