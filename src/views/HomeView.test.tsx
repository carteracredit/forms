import { describe, expect, it, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { cleanup } from "@testing-library/react";
import { HomeView } from "./HomeView";
import type { Task } from "@/lib/api/tasks";
import { axe } from "vitest-axe";

describe("HomeView", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders with empty initial tasks", () => {
		render(<HomeView initialTasks={[]} />);

		expect(screen.getByText("Tasks")).toBeInTheDocument();
		expect(
			screen.getByText(
				"A tiny Tasks example: add tasks, mark them complete, and remove them. Data is synced with the backend API.",
			),
		).toBeInTheDocument();
	});

	it("has no obvious accessibility violations", async () => {
		const { container } = render(<HomeView initialTasks={[]} />);
		// Sanity check that interactive controls exist before scanning.
		expect(screen.getByLabelText("New task")).toBeInTheDocument();
		const results = await axe(container);
		expect(results.violations).toEqual([]);
	});

	it("renders with initial tasks", () => {
		const tasks: Task[] = [
			{
				id: 1,
				name: "Test Task",
				slug: "test-task-1",
				description: "Test description",
				completed: false,
				due_date: new Date().toISOString(),
			},
		];

		render(<HomeView initialTasks={tasks} />);

		expect(screen.getByText("Tasks")).toBeInTheDocument();
		expect(
			screen.getByText(
				"A tiny Tasks example: add tasks, mark them complete, and remove them. Data is synced with the backend API.",
			),
		).toBeInTheDocument();
	});

	it("displays the correct header title", () => {
		render(<HomeView initialTasks={[]} />);

		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading).toHaveTextContent("Tasks");
		expect(heading).toHaveClass("text-3xl", "font-semibold", "tracking-tight");
	});

	it("displays the correct description", () => {
		render(<HomeView initialTasks={[]} />);

		const description = screen.getByText(
			"A tiny Tasks example: add tasks, mark them complete, and remove them. Data is synced with the backend API.",
		);
		expect(description).toBeInTheDocument();
		expect(description).toHaveClass("mt-2", "text-sm", "text-muted-foreground");
	});

	it("has correct layout structure and classes", () => {
		const { container } = render(<HomeView initialTasks={[]} />);

		const mainContainer = container.firstChild as HTMLElement;
		expect(mainContainer).toHaveClass(
			"min-h-screen",
			"px-4",
			"py-8",
			"font-(family-name:--font-geist-sans)",
			"sm:px-6",
			"sm:py-12",
		);

		const main = screen.getByRole("main");
		expect(main).toHaveClass("mx-auto", "w-full", "max-w-2xl");

		const header = screen.getByRole("banner");
		expect(header).toHaveClass("mb-8");
	});

	it("passes initialTasks prop to TodoApp", () => {
		const tasks: Task[] = [
			{
				id: 1,
				name: "Task 1",
				slug: "task-1",
				description: "",
				completed: false,
				due_date: new Date().toISOString(),
			},
			{
				id: 2,
				name: "Task 2",
				slug: "task-2",
				description: "",
				completed: true,
				due_date: new Date().toISOString(),
			},
		];

		render(<HomeView initialTasks={tasks} />);

		// Verify that TodoApp receives and renders the tasks
		expect(screen.getByText("Task 1")).toBeInTheDocument();
		expect(screen.getByText("Task 2")).toBeInTheDocument();
	});

	it("renders TodoApp component", () => {
		render(<HomeView initialTasks={[]} />);

		// Verify TodoApp is rendered by checking for its form input
		expect(screen.getByLabelText("New task")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
	});
});
