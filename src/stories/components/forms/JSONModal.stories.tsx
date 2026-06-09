import type { Decorator, Meta, StoryObj } from "@storybook/react";
import { LanguageProvider } from "@/components/LanguageProvider";
import { JSONModal } from "@/components/forms/json-modal";
import type { FormExport } from "@/lib/forms/form-export-schema";

const withLanguage: Decorator = (Story) => (
	<LanguageProvider defaultLanguage="en">
		<Story />
	</LanguageProvider>
);

const sampleExport: FormExport = {
	metadata: {
		version: "1.0",
		kind: "form",
		exportedAt: new Date().toISOString(),
	},
	form: {
		name: "Contact Form",
		nameEs: "Formulario de Contacto",
		description: "A sample contact form for testing export/import.",
		descriptionEs: "Un formulario de contacto de ejemplo para pruebas.",
		tags: ["contact", "sample"],
	},
	fields: [
		{
			id: "f1",
			type: "name",
			label: "Full Name",
			labelEs: "Nombre Completo",
			required: true,
			properties: { includeMiddleName: true },
		},
		{
			id: "f2",
			type: "email",
			label: "Email Address",
			labelEs: "Correo Electrónico",
			placeholder: "you@example.com",
			required: true,
		},
		{
			id: "f3",
			type: "textarea",
			label: "Message",
			labelEs: "Mensaje",
			required: false,
			properties: { rows: 4 },
		},
	],
};

const noop = () => {};

const meta: Meta<typeof JSONModal> = {
	title: "Forms/JSONModal",
	component: JSONModal,
	decorators: [withLanguage],
	args: {
		open: true,
		onClose: noop,
		onImportNew: noop,
	},
};

export default meta;

type Story = StoryObj<typeof JSONModal>;

export const ExportMode: Story = {
	args: {
		mode: "export",
		exportData: sampleExport,
	},
};

export const ImportMode: Story = {
	args: {
		mode: "import",
	},
};

export const ImportModeWithReplace: Story = {
	args: {
		mode: "import",
		allowReplace: true,
		onImportReplace: noop,
	},
};

export const Spanish: Story = {
	args: {
		mode: "export",
		exportData: sampleExport,
	},
	decorators: [
		(Story) => (
			<LanguageProvider defaultLanguage="es">
				<Story />
			</LanguageProvider>
		),
	],
};
