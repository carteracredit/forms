import type { Decorator, Meta, StoryObj } from "@storybook/react";
import { LanguageProvider } from "@/components/LanguageProvider";
import { FieldShowcase } from "@/components/forms/field-showcase";

const withLanguage: Decorator = (Story) => (
	<LanguageProvider defaultLanguage="en">
		<Story />
	</LanguageProvider>
);

const meta: Meta<typeof FieldShowcase> = {
	title: "Forms/FieldShowcase",
	component: FieldShowcase,
	decorators: [withLanguage],
};

export default meta;

type Story = StoryObj<typeof FieldShowcase>;

export const Default: Story = {};

export const Spanish: Story = {
	decorators: [
		(Story) => (
			<LanguageProvider defaultLanguage="es">
				<Story />
			</LanguageProvider>
		),
	],
};
