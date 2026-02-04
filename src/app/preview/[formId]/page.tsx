"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFormStore } from "@/lib/form-store";
import { useLanguage } from "@/components/LanguageProvider";
import { FormFieldRenderer } from "@/components/forms/form-field-renderer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Monitor, Tablet, Smartphone, Send } from "lucide-react";

type ViewportSize = "desktop" | "tablet" | "mobile";

const viewportSizes: Record<
	ViewportSize,
	{ width: string; icon: React.ReactNode }
> = {
	desktop: { width: "100%", icon: <Monitor className="h-4 w-4" /> },
	tablet: { width: "768px", icon: <Tablet className="h-4 w-4" /> },
	mobile: { width: "375px", icon: <Smartphone className="h-4 w-4" /> },
};

export default function FormPreviewPage() {
	const params = useParams();
	const router = useRouter();
	const formId = params.formId as string;
	const { forms, setSelectedForm, selectedForm, selectedVersion } =
		useFormStore();
	const { t, getFieldLabel } = useLanguage();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [formData, setFormData] = useState<Record<string, any>>({});
	const [viewport, setViewport] = useState<ViewportSize>("desktop");

	useEffect(() => {
		if (formId) {
			setSelectedForm(formId);
		}
	}, [formId, setSelectedForm]);

	if (!selectedForm || !selectedVersion) {
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-muted-foreground">
					{t("formEditor.noFormSelected")}
				</p>
			</div>
		);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleFieldChange = (fieldId: string, value: any) => {
		setFormData((prev) => ({ ...prev, [fieldId]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// In a real app, this would submit the form data
		console.log("Form submitted:", formData);
		alert(t("common.submit") + "!");
	};

	const handleReset = () => {
		setFormData({});
	};

	return (
		<div className="min-h-screen bg-muted/30">
			{/* Header */}
			<header className="sticky top-0 z-50 border-b bg-background px-4 py-3">
				<div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => router.back()}
							className="gap-2"
						>
							<ArrowLeft className="h-4 w-4" />
							{t("preview.back")}
						</Button>
						<div className="hidden sm:block">
							<h1 className="text-lg font-semibold">
								{getFieldLabel(selectedForm.name, selectedForm.nameEs)}
							</h1>
							<p className="text-xs text-muted-foreground">
								{t("preview.title")} - v{selectedVersion.version}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Select
							value={viewport}
							onValueChange={(v) => setViewport(v as ViewportSize)}
						>
							<SelectTrigger className="w-[140px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="desktop">
									<span className="flex items-center gap-2">
										<Monitor className="h-4 w-4" />
										{t("preview.desktop")}
									</span>
								</SelectItem>
								<SelectItem value="tablet">
									<span className="flex items-center gap-2">
										<Tablet className="h-4 w-4" />
										{t("preview.tablet")}
									</span>
								</SelectItem>
								<SelectItem value="mobile">
									<span className="flex items-center gap-2">
										<Smartphone className="h-4 w-4" />
										{t("preview.mobile")}
									</span>
								</SelectItem>
							</SelectContent>
						</Select>

						<Button variant="outline" size="sm" onClick={handleReset}>
							{t("preview.resetForm")}
						</Button>
					</div>
				</div>
			</header>

			{/* Preview Content */}
			<main className="p-4 md:p-6">
				<div
					className="mx-auto transition-all duration-300"
					style={{ maxWidth: viewportSizes[viewport].width }}
				>
					<Card className="p-6 md:p-8">
						{/* Form Header */}
						<div className="mb-8">
							<h2 className="text-2xl font-bold mb-2">
								{getFieldLabel(selectedForm.name, selectedForm.nameEs)}
							</h2>
							<p className="text-muted-foreground">
								{getFieldLabel(
									selectedForm.description,
									selectedForm.descriptionEs,
								)}
							</p>
							<div className="flex items-center gap-2 mt-3">
								<Badge variant="outline">v{selectedVersion.version}</Badge>
								<Badge
									variant="outline"
									className={
										selectedForm.status === "published"
											? "bg-emerald-100 text-emerald-700 border-emerald-200"
											: selectedForm.status === "draft"
												? "bg-amber-100 text-amber-700 border-amber-200"
												: "bg-slate-100 text-slate-700 border-slate-200"
									}
								>
									{t(`status.${selectedForm.status}`)}
								</Badge>
							</div>
						</div>

						{/* Form Fields */}
						<form onSubmit={handleSubmit}>
							{selectedVersion.fields.length === 0 ? (
								<p className="text-muted-foreground text-center py-8">
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

							{/* Submit Button */}
							{selectedVersion.fields.length > 0 && (
								<div className="mt-8 pt-6 border-t flex justify-end gap-3">
									<Button type="button" variant="outline" onClick={handleReset}>
										{t("common.reset")}
									</Button>
									<Button type="submit" className="gap-2">
										<Send className="h-4 w-4" />
										{t("preview.submitForm")}
									</Button>
								</div>
							)}
						</form>
					</Card>
				</div>
			</main>
		</div>
	);
}
