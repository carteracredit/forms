"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFormStore } from "@/lib/form-store";
import { useLanguage } from "@/components/LanguageProvider";
import { FormFieldRenderer } from "@/components/forms/form-field-renderer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ArrowLeft,
	Monitor,
	Tablet,
	Smartphone,
	Send,
	FileJson,
	Code,
	Eye,
	ZoomIn,
	ZoomOut,
	Contrast,
	Type,
} from "lucide-react";

type ViewportSize = "desktop" | "tablet" | "mobile";

const viewportSizes: Record<
	ViewportSize,
	{ width: string; icon: React.ReactNode }
> = {
	desktop: { width: "100%", icon: <Monitor className="h-4 w-4" /> },
	tablet: { width: "768px", icon: <Tablet className="h-4 w-4" /> },
	mobile: { width: "375px", icon: <Smartphone className="h-4 w-4" /> },
};

function getViewportWidth(viewport: ViewportSize): string {
	return viewportSizes[viewport].width;
}

export default function FormPreviewPage() {
	const params = useParams();
	const router = useRouter();
	const formId = params.formId as string;
	const { setSelectedForm, selectedForm, selectedVersion } = useFormStore();
	const { t, getFieldLabel } = useLanguage();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [formData, setFormData] = useState<Record<string, any>>({});
	const [viewport, setViewport] = useState<ViewportSize>("desktop");
	const [showOutput, setShowOutput] = useState(false);
	const [customInputSchema, setCustomInputSchema] = useState("");
	const [inputSchemaError, setInputSchemaError] = useState<string | null>(null);
	const [highContrast, setHighContrast] = useState(false);
	const [largeText, setLargeText] = useState(false);
	const [zoom, setZoom] = useState(100);

	useEffect(() => {
		if (formId) {
			setSelectedForm(formId);
		}
	}, [formId, setSelectedForm]);

	useEffect(() => {
		if (!selectedVersion) return;
		if (selectedVersion.schema?.input) {
			setCustomInputSchema(
				JSON.stringify(selectedVersion.schema.input, null, 2),
			);
			// Initial pre-fill from version schema
			const schema = selectedVersion.schema.input as Record<string, unknown>;
			const initial: Record<string, unknown> = {};
			selectedVersion.fields.forEach((field) => {
				const schemaKey = field.label.toLowerCase().replace(/\s+/g, "_");
				if (schema[schemaKey] !== undefined) {
					initial[field.id] = schema[schemaKey];
				} else if (field.type === "checkbox-group") {
					initial[field.id] = [];
				} else if (field.type === "checkbox") {
					initial[field.id] = false;
				} else if (field.type === "address") {
					initial[field.id] = {
						street: "",
						street2: "",
						city: "",
						state: "",
						zip: "",
						country: "",
					};
				} else {
					initial[field.id] = "";
				}
			});
			setFormData(initial as Record<string, unknown>);
		} else {
			const initial: Record<string, unknown> = {};
			selectedVersion.fields.forEach((field) => {
				if (field.type === "checkbox-group") {
					initial[field.id] = [];
				} else if (field.type === "checkbox") {
					initial[field.id] = false;
				} else if (field.type === "address") {
					initial[field.id] = {
						street: "",
						street2: "",
						city: "",
						state: "",
						zip: "",
						country: "",
					};
				} else {
					initial[field.id] = "";
				}
			});
			setFormData(initial as Record<string, unknown>);
		}
	}, [selectedVersion]);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleFieldChange = (fieldId: string, value: any) => {
		setFormData((prev) => ({ ...prev, [fieldId]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setShowOutput(true);
	};

	const handleReset = () => {
		const initial: Record<string, unknown> = {};
		selectedVersion?.fields.forEach((field) => {
			if (field.type === "checkbox-group") {
				initial[field.id] = [];
			} else if (field.type === "checkbox") {
				initial[field.id] = false;
			} else if (field.type === "address") {
				initial[field.id] = {
					street: "",
					street2: "",
					city: "",
					state: "",
					zip: "",
					country: "",
				};
			} else {
				initial[field.id] = "";
			}
		});
		setFormData(initial as Record<string, unknown>);
		setShowOutput(false);
	};

	const applyInputSchema = () => {
		if (!selectedVersion) return;
		try {
			const schema = JSON.parse(customInputSchema) as Record<string, unknown>;
			const prefilled = { ...formData };
			selectedVersion.fields.forEach((field) => {
				const schemaKey = field.label.toLowerCase().replace(/\s+/g, "_");
				if (schema[schemaKey] !== undefined) {
					prefilled[field.id] = schema[schemaKey];
				}
			});
			setFormData(prefilled);
			setInputSchemaError(null);
		} catch {
			setInputSchemaError(t("validation.invalidJsonFormat"));
		}
	};

	const generateOutputSchema = (): Record<string, unknown> => {
		if (!selectedVersion) return {};
		const output: Record<string, unknown> = {};
		selectedVersion.fields.forEach((field) => {
			const schemaKey = field.label.toLowerCase().replace(/\s+/g, "_");
			output[schemaKey] = formData[field.id];
		});
		return output;
	};

	if (!selectedForm || !selectedVersion) {
		return (
			<div className="flex h-screen items-center justify-center">
				<p className="text-muted-foreground">
					{t("formEditor.noFormSelected")}
				</p>
			</div>
		);
	}

	return (
		<div className="flex h-screen flex-col bg-background overflow-hidden">
			{/* Header */}
			<header className="flex-shrink-0 border-b bg-card px-4 py-3 md:px-6">
				<div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
					<div className="flex min-w-0 items-center gap-3">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => router.back()}
							className="gap-2"
						>
							<ArrowLeft className="h-4 w-4" />
							{t("preview.back")}
						</Button>
						<div className="min-w-0 hidden sm:block">
							<h1 className="truncate text-base font-bold sm:text-lg">
								{t("preview.title")}
							</h1>
							<p className="truncate text-xs text-muted-foreground sm:text-sm">
								{getFieldLabel(selectedForm.name, selectedForm.nameEs)} - v
								{selectedVersion.version}
							</p>
						</div>
					</div>

					<div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
						{/* Viewport size - icon buttons */}
						<div className="flex rounded-md border p-0.5">
							{(Object.keys(viewportSizes) as ViewportSize[]).map((v) => (
								<Button
									key={v}
									variant={viewport === v ? "secondary" : "ghost"}
									size="sm"
									className="h-8 w-8 p-0"
									onClick={() => setViewport(v)}
									title={t(`preview.${v}`)}
								>
									{viewportSizes[v].icon}
								</Button>
							))}
						</div>

						<Separator orientation="vertical" className="h-6" />

						{/* Accessibility */}
						<div className="flex items-center gap-0.5 rounded-md border p-0.5">
							<Button
								variant={highContrast ? "secondary" : "ghost"}
								size="sm"
								className="h-8 w-8 p-0"
								onClick={() => setHighContrast(!highContrast)}
								title={t("preview.highContrast")}
							>
								<Contrast className="h-4 w-4" />
							</Button>
							<Button
								variant={largeText ? "secondary" : "ghost"}
								size="sm"
								className="h-8 w-8 p-0"
								onClick={() => setLargeText(!largeText)}
								title={t("preview.largeText")}
							>
								<Type className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0"
								onClick={() =>
									setZoom((z) => Math.max(50, Math.min(150, z - 10)))
								}
								title={t("preview.zoomOut")}
							>
								<ZoomOut className="h-4 w-4" />
							</Button>
							<span className="px-1 text-xs tabular-nums">{zoom}%</span>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0"
								onClick={() =>
									setZoom((z) => Math.max(50, Math.min(150, z + 10)))
								}
								title={t("preview.zoomIn")}
							>
								<ZoomIn className="h-4 w-4" />
							</Button>
						</div>

						<Button variant="outline" size="sm" onClick={handleReset}>
							{t("preview.resetForm")}
						</Button>
					</div>
				</div>
			</header>

			{/* Content: sidebar + main */}
			<div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
				{/* Sidebar - Input Schema Tester */}
				<div className="max-h-[40vh] w-full flex-shrink-0 overflow-y-auto border-b bg-muted/30 lg:max-h-none lg:w-80 lg:border-b-0 lg:border-r">
					<div className="space-y-4 p-3 sm:p-4">
						<div className="flex items-center gap-2">
							<FileJson className="h-5 w-5 text-primary" />
							<h2 className="font-semibold">
								{t("preview.inputSchemaTester")}
							</h2>
						</div>
						<p className="text-xs text-muted-foreground sm:text-sm">
							{t("preview.inputSchemaDesc")}
						</p>

						<div className="space-y-2">
							<Label className="text-sm">{t("preview.inputSchemaJSON")}</Label>
							<Textarea
								value={customInputSchema}
								onChange={(e) => setCustomInputSchema(e.target.value)}
								className={`h-32 resize-none font-mono text-xs sm:h-48 ${inputSchemaError ? "border-destructive" : ""}`}
								placeholder="{}"
							/>
							{inputSchemaError && (
								<p className="text-xs text-destructive">{inputSchemaError}</p>
							)}
						</div>

						<Button onClick={applyInputSchema} className="w-full" size="sm">
							{t("preview.applyPreFill")}
						</Button>

						<Separator />

						<div className="space-y-2">
							<Label className="text-sm">{t("preview.fieldMapping")}</Label>
							<div className="space-y-1 overflow-x-auto">
								{selectedVersion.fields.map((field) => (
									<div
										key={field.id}
										className="whitespace-nowrap rounded border bg-background p-2 text-xs"
									>
										<span className="font-mono text-primary">
											{field.label.toLowerCase().replace(/\s+/g, "_")}
										</span>
										<span className="text-muted-foreground">
											{" "}
											→ {getFieldLabel(field.label, field.labelEs)}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Main - Form or Output Schema */}
				<main className="flex-1 overflow-y-auto bg-muted/20 p-4">
					<div
						className="mx-auto transition-all duration-300"
						style={{
							width: getViewportWidth(viewport),
							maxWidth: "100%",
							minWidth:
								viewport !== "desktop" ? getViewportWidth(viewport) : undefined,
						}}
					>
						<Card
							className={`p-4 sm:p-6 ${highContrast ? "border-2 border-foreground" : ""}`}
							style={{
								transform: `scale(${zoom / 100})`,
								transformOrigin: "top center",
								fontSize: largeText ? "1.125rem" : undefined,
							}}
						>
							{showOutput ? (
								<div className="space-y-4">
									<div className="flex items-center gap-2">
										<Code className="h-5 w-5 text-primary" />
										<h3 className="font-semibold">
											{t("preview.outputSchema")}
										</h3>
									</div>
									<pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-xs sm:text-sm">
										{JSON.stringify(generateOutputSchema(), null, 2)}
									</pre>
									<Button
										onClick={() => setShowOutput(false)}
										variant="outline"
										className="gap-2"
									>
										<Eye className="h-4 w-4" />
										{t("preview.backToForm")}
									</Button>
								</div>
							) : (
								<>
									<div className="mb-6 md:mb-8">
										<h2 className="mb-2 text-2xl font-bold">
											{getFieldLabel(selectedForm.name, selectedForm.nameEs)}
										</h2>
										<p className="text-muted-foreground">
											{getFieldLabel(
												selectedForm.description,
												selectedForm.descriptionEs,
											)}
										</p>
										<div className="mt-3 flex items-center gap-2">
											<Badge variant="outline">
												v{selectedVersion.version}
											</Badge>
											<Badge
												variant="outline"
												className={
													selectedForm.status === "published"
														? "border-emerald-200 bg-emerald-100 text-emerald-700"
														: selectedForm.status === "draft"
															? "border-amber-200 bg-amber-100 text-amber-700"
															: "border-slate-200 bg-slate-100 text-slate-700"
												}
											>
												{t(`status.${selectedForm.status}`)}
											</Badge>
										</div>
									</div>

									<form onSubmit={handleSubmit} className="space-y-6">
										{selectedVersion.fields.length === 0 ? (
											<p className="py-8 text-center text-muted-foreground">
												{t("formDetail.noFieldsYet")}
											</p>
										) : (
											<div className="space-y-6">
												{selectedVersion.fields.map((field) => (
													<FormFieldRenderer
														key={field.id}
														field={field}
														value={formData[field.id]}
														onChange={handleFieldChange}
													/>
												))}
											</div>
										)}

										{selectedVersion.fields.length > 0 && (
											<div className="flex justify-end gap-3 border-t pt-6">
												<Button
													type="button"
													variant="outline"
													onClick={handleReset}
												>
													{t("common.reset")}
												</Button>
												<Button type="submit" className="gap-2">
													<Send className="h-4 w-4" />
													{t("preview.submitForm")}
												</Button>
											</div>
										)}
									</form>
								</>
							)}
						</Card>
					</div>
				</main>
			</div>
		</div>
	);
}
