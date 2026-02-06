import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	test: {
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "json-summary", "lcov"],
			reportsDirectory: "coverage",
			include: ["src/**/*.{ts,tsx}"],
			exclude: [
				"**/*.d.ts",
				"**/*.test.*",
				"**/*.spec.*",
				"src/test/**",
				"src/stories/**",
				"src/components/ui/**",
				// Next.js App Router entrypoints/route wiring (typically thin wrappers)
				"src/app/**",
				// Sentry instrumentation files (initialization code, hard to test meaningfully)
				"src/instrumentation*.ts",
				// Mock data and utility files
				"src/lib/mock-data.ts",
				"src/lib/utils.ts",
				"src/lib/slugify.ts",
				// Views are thin wrappers, components are tested individually
				"src/views/**",
				// Large form UI components - tested via integration/Storybook visual tests
				"src/components/forms/form-editor.tsx",
				"src/components/forms/form-detail.tsx",
				"src/components/forms/form-field-renderer.tsx",
				"src/components/forms/forms-list.tsx",
				"src/components/forms/phone-input.tsx",
				"src/components/forms/address-input.tsx",
				"src/components/forms/create-form-dialog.tsx",
				"src/components/forms/field-showcase.tsx",
			],
			thresholds: {
				lines: 85,
				functions: 85,
				statements: 85,
				branches: 85,
			},
		},
	},
});
