import type { Decorator, Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { LanguageProvider } from "@/components/LanguageProvider";
import { FormFieldRenderer } from "@/components/forms/form-field-renderer";
import type { FormField } from "@/lib/types/form";

const withLanguage: Decorator = (Story) => (
	<LanguageProvider defaultLanguage="en">
		<div className="max-w-md p-4">
			<Story />
		</div>
	</LanguageProvider>
);

const meta: Meta<typeof FormFieldRenderer> = {
	title: "Forms/FormFieldRenderer",
	component: FormFieldRenderer,
	decorators: [withLanguage],
};

export default meta;

type Story = StoryObj<typeof FormFieldRenderer>;

function LiveField({ field }: { field: FormField }) {
	const [value, setValue] = useState("");
	return (
		<FormFieldRenderer
			field={field}
			value={value}
			onChange={(_id, next) => setValue(String(next ?? ""))}
		/>
	);
}

export const DateWithOffsets: Story = {
	render: () => (
		<LiveField
			field={{
				id: "birth",
				type: "date",
				label: "Birth date",
				required: true,
				properties: {
					dateMinOffset: { direction: "past", years: 2 },
					dateMaxOffset: { direction: "future", years: 1 },
				},
			}}
		/>
	),
};

export const DateTimeWithOffsets: Story = {
	render: () => (
		<LiveField
			field={{
				id: "appointment",
				type: "datetime",
				label: "Appointment",
				required: true,
				properties: {
					dateMinOffset: { direction: "past", days: 15, hours: 2 },
					dateMaxOffset: { direction: "future", days: 40, hours: 5 },
				},
			}}
		/>
	),
};

export const MonthWithOffsets: Story = {
	render: () => (
		<LiveField
			field={{
				id: "start-month",
				type: "month",
				label: "Start month",
				required: true,
				properties: {
					monthMinOffset: { direction: "past", years: 2, months: 1 },
					monthMaxOffset: { direction: "future", months: 3 },
				},
			}}
		/>
	),
};
