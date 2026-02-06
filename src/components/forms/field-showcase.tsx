"use client";

import type React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	User,
	Phone,
	Mail,
	FileText,
	MapPin,
	Upload,
	CheckSquare,
	Circle,
	ListChecks,
	Info,
	Hash,
	Link,
	Lock,
	Star,
	Calendar,
	Clock,
	AlignLeft,
	ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface FieldType {
	type: string;
	name: string;
	icon: React.ReactNode;
	description: string;
	properties: {
		name: string;
		type: string;
		description: string;
		required?: boolean;
	}[];
	features: string[];
	inputSchema: Record<string, unknown>;
	outputSchema: Record<string, unknown>;
	example: string;
}

export function FieldShowcase() {
	const { t } = useLanguage();

	const fieldTypes: FieldType[] = [
		{
			type: "name",
			name: t("fieldTypes.name"),
			icon: <User className="h-5 w-5" />,
			description: t("fieldLibrary.nameFieldDesc"),
			properties: [
				{
					name: "label",
					type: "string",
					description: t("fieldLibrary.displayLabel"),
					required: true,
				},
				{
					name: "placeholder",
					type: "string",
					description: t("fieldLibrary.hintText"),
				},
				{
					name: "required",
					type: "boolean",
					description: t("fieldLibrary.fieldRequired"),
				},
			],
			features: [
				t("fieldLibrary.autoCapitalization"),
				t("fieldLibrary.trimWhitespace"),
				t("fieldLibrary.validationMinChars"),
				t("fieldLibrary.supportsFullName"),
			],
			inputSchema: { firstName: "John", lastName: "Doe" },
			outputSchema: { fullName: "string" },
			example: "John Doe",
		},
		{
			type: "phone",
			name: t("fieldTypes.phone"),
			icon: <Phone className="h-5 w-5" />,
			description: t("fieldLibrary.phoneFieldDesc"),
			properties: [
				{
					name: "label",
					type: "string",
					description: t("fieldLibrary.displayLabel"),
					required: true,
				},
				{
					name: "placeholder",
					type: "string",
					description: t("fieldLibrary.phoneFormat"),
				},
				{
					name: "required",
					type: "boolean",
					description: t("fieldLibrary.fieldRequired"),
				},
			],
			features: [
				t("fieldLibrary.autoFormatting"),
				t("fieldLibrary.internationalFormat"),
				t("fieldLibrary.validationPhoneStructure"),
				t("fieldLibrary.countryCodeDetection"),
			],
			inputSchema: { phone: "+14155552671" },
			outputSchema: { phone: "string", phoneFormatted: "string" },
			example: "+1 (415) 555-2671",
		},
		{
			type: "email",
			name: t("fieldTypes.email"),
			icon: <Mail className="h-5 w-5" />,
			description: t("fieldLibrary.emailFieldDesc"),
			properties: [
				{
					name: "label",
					type: "string",
					description: t("fieldLibrary.displayLabel"),
					required: true,
				},
				{
					name: "placeholder",
					type: "string",
					description: t("fieldLibrary.emailFormat"),
				},
				{
					name: "required",
					type: "boolean",
					description: t("fieldLibrary.fieldRequired"),
				},
			],
			features: [
				t("fieldLibrary.rfc5322Validation"),
				t("fieldLibrary.domainVerification"),
				t("fieldLibrary.lowercaseNormalization"),
				t("fieldLibrary.duplicateDetection"),
			],
			inputSchema: { email: "user@company.com" },
			outputSchema: { email: "string", emailVerified: "boolean" },
			example: "user@example.com",
		},
		{
			type: "text",
			name: t("fieldTypes.text"),
			icon: <FileText className="h-5 w-5" />,
			description: t("fieldLibrary.textFieldDesc"),
			properties: [
				{
					name: "label",
					type: "string",
					description: t("fieldLibrary.displayLabel"),
					required: true,
				},
				{
					name: "placeholder",
					type: "string",
					description: t("fieldLibrary.hintText"),
				},
				{
					name: "required",
					type: "boolean",
					description: t("fieldLibrary.fieldRequired"),
				},
				{
					name: "validation.min",
					type: "number",
					description: t("fieldLibrary.minCharCount"),
				},
				{
					name: "validation.max",
					type: "number",
					description: t("fieldLibrary.maxCharCount"),
				},
			],
			features: [
				t("fieldLibrary.autoExpandingTextarea"),
				t("fieldLibrary.characterCountDisplay"),
				t("fieldLibrary.minMaxLengthValidation"),
				t("fieldLibrary.lineBreakPreservation"),
			],
			inputSchema: { defaultText: "Pre-filled content" },
			outputSchema: {
				text: "string",
				characterCount: "number",
				wordCount: "number",
			},
			example: "This is a longer text response that can span multiple lines...",
		},
		{
			type: "textarea",
			name: t("fieldTypes.textarea"),
			icon: <AlignLeft className="h-5 w-5" />,
			description: t("fieldLibrary.textareaFieldDesc"),
			properties: [
				{
					name: "label",
					type: "string",
					description: t("fieldLibrary.displayLabel"),
					required: true,
				},
				{
					name: "placeholder",
					type: "string",
					description: t("fieldLibrary.hintText"),
				},
				{
					name: "required",
					type: "boolean",
					description: t("fieldLibrary.fieldRequired"),
				},
				{
					name: "rows",
					type: "number",
					description: t("fieldLibrary.visibleRows"),
				},
				{
					name: "maxLength",
					type: "number",
					description: t("fieldLibrary.maxCharCount"),
				},
			],
			features: [
				t("fieldLibrary.autoExpandingTextarea"),
				t("fieldLibrary.characterCountDisplay"),
				t("fieldLibrary.minMaxLengthValidation"),
				t("fieldLibrary.lineBreakPreservation"),
				t("fieldLibrary.scrollableForLongContent"),
			],
			inputSchema: { defaultText: "Pre-filled content here..." },
			outputSchema: {
				text: "string",
				characterCount: "number",
				wordCount: "number",
			},
			example:
				"This is a longer text response that spans multiple lines and can contain detailed information...",
		},
		{
			type: "number",
			name: t("fieldTypes.number"),
			icon: <Hash className="h-5 w-5" />,
			description: t("fieldLibrary.numberFieldDesc"),
			properties: [
				{
					name: "label",
					type: "string",
					description: t("fieldLibrary.displayLabel"),
					required: true,
				},
				{
					name: "placeholder",
					type: "string",
					description: t("fieldLibrary.hintText"),
				},
				{
					name: "required",
					type: "boolean",
					description: t("fieldLibrary.fieldRequired"),
				},
				{
					name: "min",
					type: "number",
					description: t("fieldLibrary.minAllowedValue"),
				},
				{
					name: "max",
					type: "number",
					description: t("fieldLibrary.maxAllowedValue"),
				},
				{
					name: "step",
					type: "number",
					description: t("fieldLibrary.stepControl"),
				},
			],
			features: [
				t("fieldLibrary.numericKeyboard"),
				t("fieldLibrary.minMaxValueValidation"),
				t("fieldLibrary.decimalSupport"),
				t("fieldLibrary.spinnerControls"),
				t("fieldLibrary.scientificNotationSupport"),
			],
			inputSchema: { value: 42 },
			outputSchema: { value: "number", isInteger: "boolean" },
			example: "42 or 3.14159",
		},
		{
			type: "url",
			name: t("fieldTypes.url"),
			icon: <Link className="h-5 w-5" />,
			description: t("fieldLibrary.urlFieldDesc"),
			properties: [
				{
					name: "label",
					type: "string",
					description: t("fieldLibrary.displayLabel"),
					required: true,
				},
				{
					name: "placeholder",
					type: "string",
					description: t("fieldLibrary.urlFormat"),
				},
				{
					name: "required",
					type: "boolean",
					description: t("fieldLibrary.fieldRequired"),
				},
			],
			features: [
				t("fieldLibrary.urlFormatValidation"),
				t("fieldLibrary.protocolDetection"),
				t("fieldLibrary.domainValidation"),
				t("fieldLibrary.autoPrependHttps"),
				t("fieldLibrary.linkPreview"),
			],
			inputSchema: { url: "https://example.com" },
			outputSchema: {
				url: "string",
				protocol: "string",
				domain: "string",
				isValid: "boolean",
			},
			example: "https://www.example.com/path",
		},
		{
			type: "password",
			name: t("fieldTypes.password"),
			icon: <Lock className="h-5 w-5" />,
			description: t("fieldLibrary.passwordFieldDesc"),
			properties: [
				{
					name: "label",
					type: "string",
					description: t("fieldLibrary.displayLabel"),
					required: true,
				},
				{
					name: "placeholder",
					type: "string",
					description: t("fieldLibrary.hintText"),
				},
				{
					name: "required",
					type: "boolean",
					description: t("fieldLibrary.fieldRequired"),
				},
				{
					name: "minLength",
					type: "number",
					description: t("fieldLibrary.minPasswordLength"),
				},
				{
					name: "showStrength",
					type: "boolean",
					description: t("fieldLibrary.showStrengthIndicator"),
				},
			],
			features: [
				t("fieldLibrary.maskedCharacterDisplay"),
				t("fieldLibrary.showHidePasswordToggle"),
				t("fieldLibrary.passwordStrengthMeter"),
				t("fieldLibrary.lengthValidation"),
				t("fieldLibrary.complexityRequirements"),
				t("fieldLibrary.copyPasteProtection"),
			],
			inputSchema: {},
			outputSchema: {
				value: "string",
				strength: "weak | medium | strong",
				hashedValue: "string",
			},
			example: "•••••••• (masked)",
		},
		{
			type: "dropdown",
			name: t("fieldTypes.dropdown"),
			icon: <ChevronDown className="h-5 w-5" />,
			description: t("fieldLibrary.dropdownFieldDesc"),
			properties: [
				{
					name: "label",
					type: "string",
					description: t("fieldLibrary.displayLabel"),
					required: true,
				},
				{
					name: "placeholder",
					type: "string",
					description: t("fieldLibrary.noSelectionText"),
				},
				{
					name: "options",
					type: "string[]",
					description: t("fieldLibrary.availableOptions"),
					required: true,
				},
				{
					name: "required",
					type: "boolean",
					description: t("fieldLibrary.selectionRequired"),
				},
			],
			features: [
				t("fieldLibrary.searchableOptions"),
				t("fieldLibrary.keyboardNavigation"),
				t("fieldLibrary.customOptionValues"),
				t("fieldLibrary.groupedOptionsSupport"),
				t("fieldLibrary.compactDisplay"),
			],
			inputSchema: { selectedValue: "Option 2" },
			outputSchema: { value: "string", label: "string", index: "number" },
			example: "California (from list of US states)",
		},
		{
			type: "address",
			name: t("fieldTypes.address"),
			icon: <MapPin className="h-5 w-5" />,
			description: t("fieldLibrary.addressFieldDesc"),
			properties: [
				{
					name: "label",
					type: "string",
					description: t("fieldLibrary.displayLabel"),
					required: true,
				},
				{
					name: "placeholder",
					type: "string",
					description: t("fieldLibrary.addressFormat"),
				},
				{
					name: "required",
					type: "boolean",
					description: t("fieldLibrary.fieldRequired"),
				},
			],
			features: [
				t("fieldLibrary.googleMapsAutocomplete"),
				t("fieldLibrary.addressParsing"),
				t("fieldLibrary.geocodingSupport"),
				t("fieldLibrary.internationalAddressFormats"),
			],
			inputSchema: {
				street: "123 Main St",
				city: "San Francisco",
				state: "CA",
				zip: "94102",
			},
			outputSchema: {
				fullAddress: "string",
				street: "string",
				city: "string",
				state: "string",
				postalCode: "string",
				country: "string",
				coordinates: { lat: "number", lng: "number" },
			},
			example: "123 Main St, San Francisco, CA 94102",
		},
		{
			type: "file",
			name: t("fieldTypes.file"),
			icon: <Upload className="h-5 w-5" />,
			description: t("fieldLibrary.fileUploadDesc"),
			properties: [
				{
					name: "label",
					type: "string",
					description: t("fieldLibrary.displayLabel"),
					required: true,
				},
				{
					name: "placeholder",
					type: "string",
					description: t("fieldLibrary.uploadInstruction"),
				},
				{
					name: "required",
					type: "boolean",
					description: t("fieldLibrary.fieldRequired"),
				},
				{
					name: "validation.maxSize",
					type: "number",
					description: t("fieldLibrary.maxFileSize"),
				},
				{
					name: "validation.allowedTypes",
					type: "string[]",
					description: t("fieldLibrary.allowedFileTypes"),
				},
			],
			features: [
				t("fieldLibrary.dragAndDropUpload"),
				t("fieldLibrary.multipleFileSupport"),
				t("fieldLibrary.fileTypeValidation"),
				t("fieldLibrary.sizeLimitEnforcement"),
				t("fieldLibrary.previewImagesPDFs"),
				t("fieldLibrary.uploadProgressTracking"),
			],
			inputSchema: {},
			outputSchema: {
				files: [
					{
						name: "string",
						size: "number",
						type: "string",
						url: "string",
						uploadedAt: "timestamp",
					},
				],
			},
			example: "document.pdf (2.5 MB)",
		},
		{
			type: "checkbox",
			name: t("fieldTypes.checkbox"),
			icon: <CheckSquare className="h-5 w-5" />,
			description: t("fieldLibrary.checkboxFieldDesc"),
			properties: [
				{
					name: "label",
					type: "string",
					description: t("fieldLibrary.checkboxLabel"),
					required: true,
				},
				{
					name: "required",
					type: "boolean",
					description: t("fieldLibrary.fieldRequired"),
				},
			],
			features: [
				t("fieldLibrary.trueFalseCapture"),
				t("fieldLibrary.customStylingSupport"),
				t("fieldLibrary.keyboardNavigation"),
				t("fieldLibrary.requiredValidation"),
			],
			inputSchema: { agreed: true },
			outputSchema: { checked: "boolean", checkedAt: "timestamp" },
			example: "☑ I agree to the terms and conditions",
		},
		{
			type: "radio",
			name: t("fieldTypes.radio"),
			icon: <Circle className="h-5 w-5" />,
			description: t("fieldLibrary.radioFieldDesc"),
			properties: [
				{
					name: "label",
					type: "string",
					description: t("fieldLibrary.fieldLabel"),
					required: true,
				},
				{
					name: "options",
					type: "string[]",
					description: t("fieldLibrary.choices"),
					required: true,
				},
				{
					name: "required",
					type: "boolean",
					description: t("fieldLibrary.selectionRequired"),
				},
			],
			features: [
				t("fieldLibrary.singleSelection"),
				t("fieldLibrary.customOptionValues"),
				t("fieldLibrary.keyboardNavigation"),
				t("fieldLibrary.selectedOptionIndication"),
			],
			inputSchema: { selectedOption: "Option 2" },
			outputSchema: { selected: "string", selectedIndex: "number" },
			example: "○ Option 1\n● Option 2\n○ Option 3",
		},
		{
			type: "checkbox-group",
			name: t("fieldTypes.checkboxGroup"),
			icon: <ListChecks className="h-5 w-5" />,
			description: t("fieldLibrary.checkboxGroupDesc"),
			properties: [
				{
					name: "label",
					type: "string",
					description: t("fieldLibrary.fieldLabel"),
					required: true,
				},
				{
					name: "options",
					type: "string[]",
					description: t("fieldLibrary.choices"),
					required: true,
				},
				{
					name: "required",
					type: "boolean",
					description: t("fieldLibrary.selectionRequired"),
				},
			],
			features: [
				t("fieldLibrary.multipleSelections"),
				t("fieldLibrary.selectAllClearAll"),
				t("fieldLibrary.customOptionValues"),
				t("fieldLibrary.minMaxSelectionLimits"),
			],
			inputSchema: { selectedOptions: ["Option 1", "Option 3"] },
			outputSchema: { selected: ["string"], count: "number" },
			example: "☑ Email Updates\n☐ SMS Notifications\n☑ Newsletter",
		},
		{
			type: "date",
			name: t("fieldTypes.date"),
			icon: <Calendar className="h-5 w-5" />,
			description: t("fieldLibrary.dateFieldDesc"),
			properties: [
				{
					name: "label",
					type: "string",
					description: t("fieldLibrary.displayLabel"),
					required: true,
				},
				{
					name: "required",
					type: "boolean",
					description: t("fieldLibrary.fieldRequired"),
				},
				{
					name: "min",
					type: "string",
					description: t("fieldLibrary.earliestSelectableDate"),
				},
				{
					name: "max",
					type: "string",
					description: t("fieldLibrary.latestSelectableDate"),
				},
			],
			features: [
				t("fieldLibrary.nativeDatePicker"),
				t("fieldLibrary.minMaxDateConstraints"),
				t("fieldLibrary.localeAwareFormatting"),
				t("fieldLibrary.keyboardShortcuts"),
				t("fieldLibrary.iso8601Output"),
			],
			inputSchema: { date: "2024-03-15" },
			outputSchema: {
				date: "string (ISO)",
				timestamp: "number",
				formatted: "string",
			},
			example: "March 15, 2024 or 2024-03-15",
		},
		{
			type: "time",
			name: t("fieldTypes.time"),
			icon: <Clock className="h-5 w-5" />,
			description: t("fieldLibrary.timeFieldDesc"),
			properties: [
				{
					name: "label",
					type: "string",
					description: t("fieldLibrary.displayLabel"),
					required: true,
				},
				{
					name: "required",
					type: "boolean",
					description: t("fieldLibrary.fieldRequired"),
				},
				{
					name: "step",
					type: "number",
					description: t("fieldLibrary.timeInterval"),
				},
			],
			features: [
				t("fieldLibrary.1224HourFormat"),
				t("fieldLibrary.minuteIntervalStepping"),
				t("fieldLibrary.keyboardInputSupport"),
				t("fieldLibrary.amPmSelector"),
				t("fieldLibrary.timezoneAwareness"),
			],
			inputSchema: { time: "14:30" },
			outputSchema: {
				time: "string (HH:MM)",
				hours: "number",
				minutes: "number",
				formatted: "string",
			},
			example: "2:30 PM or 14:30",
		},
		{
			type: "datetime",
			name: t("fieldTypes.datetime"),
			icon: <Clock className="h-5 w-5" />,
			description: t("fieldLibrary.datetimeFieldDesc"),
			properties: [
				{
					name: "label",
					type: "string",
					description: t("fieldLibrary.displayLabel"),
					required: true,
				},
				{
					name: "required",
					type: "boolean",
					description: t("fieldLibrary.fieldRequired"),
				},
				{
					name: "min",
					type: "string",
					description: t("fieldLibrary.earliestSelectableDatetime"),
				},
				{
					name: "max",
					type: "string",
					description: t("fieldLibrary.latestSelectableDatetime"),
				},
			],
			features: [
				t("fieldLibrary.integratedDatePicker"),
				t("fieldLibrary.timezoneSelection"),
				t("fieldLibrary.dstHandling"),
				t("fieldLibrary.iso8601DatetimeFormat"),
				t("fieldLibrary.relativeTimeDisplay"),
			],
			inputSchema: {
				datetime: "2024-03-15T14:30:00Z",
				timezone: "America/Los_Angeles",
			},
			outputSchema: {
				datetime: "string (ISO)",
				timestamp: "number",
				timezone: "string",
				formatted: "string",
			},
			example: "March 15, 2024 at 2:30 PM PST",
		},
		{
			type: "rating",
			name: t("fieldTypes.rating"),
			icon: <Star className="h-5 w-5" />,
			description: t("fieldLibrary.ratingFieldDesc"),
			properties: [
				{
					name: "label",
					type: "string",
					description: t("fieldLibrary.displayLabel"),
					required: true,
				},
				{
					name: "required",
					type: "boolean",
					description: t("fieldLibrary.fieldRequired"),
				},
				{
					name: "max",
					type: "number",
					description: t("fieldLibrary.maxRatingValue"),
				},
				{
					name: "allowHalf",
					type: "boolean",
					description: t("fieldLibrary.allowHalfStar"),
				},
			],
			features: [
				t("fieldLibrary.interactiveStarVisualization"),
				t("fieldLibrary.hoverPreview"),
				t("fieldLibrary.halfStarSupport"),
				t("fieldLibrary.customMaxRating"),
				t("fieldLibrary.touchFriendly"),
				t("fieldLibrary.clearRatingOption"),
			],
			inputSchema: { rating: 4 },
			outputSchema: {
				rating: "number",
				maxRating: "number",
				percentage: "number",
			},
			example: "★★★★☆ (4 out of 5 stars)",
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
				<Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
				<div>
					<h3 className="mb-1 font-medium text-blue-900 dark:text-blue-100">
						{t("fieldLibrary.title")}
					</h3>
					<p className="text-sm text-blue-700 dark:text-blue-300">
						{t("fieldLibrary.description")}
					</p>
				</div>
			</div>

			<div className="grid gap-4">
				{fieldTypes.map((field) => (
					<Card key={field.type} className="overflow-hidden">
						<div className="p-6">
							<div className="mb-4 flex items-start gap-4">
								<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
									{field.icon}
								</div>
								<div className="min-w-0 flex-1">
									<div className="mb-1 flex items-center gap-2">
										<h3 className="text-lg font-semibold">{field.name}</h3>
										<Badge variant="outline" className="font-mono text-xs">
											{field.type}
										</Badge>
									</div>
									<p className="text-sm text-muted-foreground">
										{field.description}
									</p>
								</div>
							</div>

							<Tabs defaultValue="properties" className="mt-4">
								<TabsList className="grid w-full grid-cols-4">
									<TabsTrigger value="properties">
										{t("fieldLibrary.properties")}
									</TabsTrigger>
									<TabsTrigger value="features">
										{t("fieldLibrary.features")}
									</TabsTrigger>
									<TabsTrigger value="input">
										{t("fieldLibrary.inputSchema")}
									</TabsTrigger>
									<TabsTrigger value="output">
										{t("fieldLibrary.outputSchema")}
									</TabsTrigger>
								</TabsList>

								<TabsContent value="properties" className="mt-4 space-y-3">
									{field.properties.map((prop) => (
										<div
											key={prop.name}
											className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"
										>
											<code className="flex-shrink-0 rounded border bg-background px-2 py-1 font-mono text-sm">
												{prop.name}
											</code>
											<div className="min-w-0 flex-1">
												<div className="mb-1 flex items-center gap-2">
													<Badge className="border-teal-500/30 bg-teal-500/20 text-teal-700 text-xs hover:bg-teal-500/30 dark:text-teal-300">
														{prop.type}
													</Badge>
													{prop.required && (
														<Badge variant="outline" className="text-xs">
															{t("fieldLibrary.required")}
														</Badge>
													)}
												</div>
												<p className="text-sm text-muted-foreground">
													{prop.description}
												</p>
											</div>
										</div>
									))}
								</TabsContent>

								<TabsContent value="features" className="mt-4">
									<ul className="space-y-2">
										{field.features.map((feature, index) => (
											<li
												key={index}
												className="flex items-start gap-2 text-sm"
											>
												<span className="mt-1 text-primary">•</span>
												<span>{feature}</span>
											</li>
										))}
									</ul>
								</TabsContent>

								<TabsContent value="input" className="mt-4 space-y-3">
									<p className="mb-3 text-sm text-muted-foreground">
										{t("fieldLibrary.useInputSchema")}
									</p>
									<div className="rounded-lg border bg-muted/50 p-4">
										<pre className="overflow-x-auto font-mono text-xs">
											<code>{JSON.stringify(field.inputSchema, null, 2)}</code>
										</pre>
									</div>
									{Object.keys(field.inputSchema).length > 0 && (
										<div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
											<p className="text-xs text-blue-700 dark:text-blue-300">
												<strong>{t("fieldLibrary.example")}</strong>:{" "}
												{t("fieldLibrary.workflowProvidesData")}
											</p>
										</div>
									)}
								</TabsContent>

								<TabsContent value="output" className="mt-4 space-y-3">
									<p className="mb-3 text-sm text-muted-foreground">
										{t("fieldLibrary.dataStructureReturned")}
									</p>
									<div className="rounded-lg border bg-muted/50 p-4">
										<pre className="overflow-x-auto font-mono text-xs">
											<code>{JSON.stringify(field.outputSchema, null, 2)}</code>
										</pre>
									</div>
									<div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
										<p className="text-xs text-emerald-700 dark:text-emerald-300">
											<strong>{t("fieldLibrary.exampleOutput")}</strong>:{" "}
											{field.example}
										</p>
									</div>
								</TabsContent>
							</Tabs>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}
