import type { Decorator, Meta, StoryObj } from "@storybook/react";
import { useState, type ComponentProps } from "react";
import { LanguageProvider } from "@/components/LanguageProvider";
import {
	DateConstraintEditor,
	type DateConstraintValue,
} from "@/components/forms/date-constraint-editor";

const withLanguage: Decorator = (Story) => (
	<LanguageProvider defaultLanguage="en">
		<div className="max-w-xl p-4">
			<Story />
		</div>
	</LanguageProvider>
);

const meta: Meta<typeof DateConstraintEditor> = {
	title: "Forms/DateConstraintEditor",
	component: DateConstraintEditor,
	decorators: [withLanguage],
};

export default meta;

type Story = StoryObj<typeof DateConstraintEditor>;

function InteractiveEditor(
	props: Omit<
		ComponentProps<typeof DateConstraintEditor>,
		"value" | "onChange"
	> & {
		initial: DateConstraintValue;
	},
) {
	const { initial, ...rest } = props;
	const [value, setValue] = useState(initial);
	return <DateConstraintEditor {...rest} value={value} onChange={setValue} />;
}

const relativeInitial: DateConstraintValue = {
	minMode: "relative",
	maxMode: "relative",
	minFixed: "",
	maxFixed: "",
	minOffset: { direction: "past", years: 2 },
	maxOffset: { direction: "future", years: 1 },
};

export const DateRelative: Story = {
	render: () => <InteractiveEditor kind="date" initial={relativeInitial} />,
};

export const DateTimeRelative: Story = {
	render: () => (
		<InteractiveEditor
			kind="datetime"
			initial={{
				...relativeInitial,
				minOffset: { direction: "past", days: 15, hours: 2 },
				maxOffset: { direction: "future", days: 40, hours: 5 },
			}}
		/>
	),
};

export const MonthRelative: Story = {
	render: () => (
		<InteractiveEditor
			kind="month"
			initial={{
				...relativeInitial,
				minOffset: { direction: "past", years: 2, months: 1 },
				maxOffset: { direction: "future", months: 3 },
			}}
		/>
	),
};

export const MixedFixedAndRelative: Story = {
	render: () => (
		<InteractiveEditor
			kind="date"
			initial={{
				minMode: "fixed",
				maxMode: "relative",
				minFixed: "2020-01-01",
				maxFixed: "",
				minOffset: { direction: "past" },
				maxOffset: { direction: "future", days: 45 },
			}}
		/>
	),
};

export const InvalidRange: Story = {
	render: () => (
		<InteractiveEditor
			kind="date"
			rangeInvalid
			initial={{
				minMode: "fixed",
				maxMode: "fixed",
				minFixed: "2030-01-01",
				maxFixed: "2020-01-01",
				minOffset: { direction: "past" },
				maxOffset: { direction: "future" },
			}}
		/>
	),
};
