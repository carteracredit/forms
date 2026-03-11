"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useFormStore } from "@/lib/form-store";
import { useLanguage } from "@/components/LanguageProvider";
import { FormsList } from "@/components/forms/forms-list";
import { FormDetail } from "@/components/forms/form-detail";
import { FormEditor } from "@/components/forms/form-editor";
import { CreateFormDialog } from "@/components/forms/create-form-dialog";
import { SessionControls } from "@/components/SessionControls";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

type ViewState = "list" | "detail" | "editor";

export function FormsHomeView() {
	const {
		setSelectedForm,
		createForm,
		startEditing,
		cancelEditing,
		fetchForms,
		isLoading,
		error,
	} = useFormStore();
	const { t } = useLanguage();
	const [view, setView] = useState<ViewState>("list");
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [initialDetailTab, setInitialDetailTab] = useState<
		"details" | "fieldLibrary"
	>("details");
	const [isNavigating, setIsNavigating] = useState(false);

	// Load forms on mount
	useEffect(() => {
		fetchForms();
	}, [fetchForms]);

	// Show error toast when store reports an error
	useEffect(() => {
		if (error) {
			toast.error(error);
		}
	}, [error]);

	const handleViewForm = async (formId: string) => {
		setIsNavigating(true);
		setSelectedForm(formId);
		// The list endpoint returns summaries without versions.
		// Refresh the full form so FormDetail has versions available.
		await useFormStore.getState().refreshForm(formId);
		// Re-select to pick up the updated form with versions
		useFormStore.getState().setSelectedForm(formId);
		setInitialDetailTab("details");
		setView("detail");
		setIsNavigating(false);
	};

	const handleEditForm = async (formId: string) => {
		setIsNavigating(true);
		setSelectedForm(formId);
		// Ensure we have the full form (with versions) before entering the editor
		await useFormStore.getState().refreshForm(formId);
		const form = useFormStore.getState().forms.find((f) => f.id === formId);
		if (form) {
			startEditing(form);
			setView("editor");
		}
		setIsNavigating(false);
	};

	const handleBack = () => {
		if (view === "editor") {
			cancelEditing();
		}
		setSelectedForm(null);
		setView("list");
	};

	const handleCreateForm = async (name: string, description: string) => {
		try {
			const newForm = await createForm(name, description);
			setSelectedForm(newForm.id);
			// Navigate to detail view with field library tab to let user explore available fields
			setInitialDetailTab("fieldLibrary");
			setView("detail");
		} catch {
			// Error is already set in store and toasted via useEffect
		}
	};

	const handleSave = () => {
		setView("detail");
	};

	return (
		<div className="min-h-screen bg-background">
			{isNavigating && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			)}
			{view === "list" ? (
				<div className="mx-auto w-full max-w-7xl min-w-0 px-4 py-8 sm:px-6 lg:px-8">
					{/* Header */}
					<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-3 min-w-0 flex-shrink-0">
							<Image
								src="/logo.svg"
								alt="Cartera Logo"
								width={32}
								height={32}
								className="h-8 w-auto shrink-0"
							/>
							<div className="min-w-0">
								<h1 className="text-xl font-bold tracking-tight truncate sm:text-2xl">
									{t("formsList.title")}
								</h1>
								<p className="text-sm text-muted-foreground truncate">
									{t("formsList.subtitle")}
								</p>
							</div>
						</div>
						<div className="flex w-full min-w-0 max-w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:shrink-0">
							<Button
								onClick={() => setShowCreateDialog(true)}
								disabled={isLoading}
								className="shrink-0"
							>
								{isLoading ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Plus className="mr-2 h-4 w-4" />
								)}
								{t("formsList.createForm")}
							</Button>
							<SessionControls className="flex-wrap justify-end" />
						</div>
					</div>

					<FormsList
						onViewForm={handleViewForm}
						onEditForm={handleEditForm}
						onCreateForm={() => setShowCreateDialog(true)}
					/>
				</div>
			) : (
				<div className="flex flex-col h-screen">
					{view === "detail" && (
						<FormDetail
							onBack={handleBack}
							initialTab={initialDetailTab}
							onEdit={() => {
								const selectedForm = useFormStore.getState().selectedForm;
								if (selectedForm) {
									startEditing(selectedForm);
									setView("editor");
								}
							}}
						/>
					)}
					{view === "editor" && (
						<FormEditor onBack={handleBack} onSave={handleSave} />
					)}
				</div>
			)}

			{/* Create Form Dialog */}
			<CreateFormDialog
				open={showCreateDialog}
				onOpenChange={setShowCreateDialog}
				onCreateForm={handleCreateForm}
			/>
		</div>
	);
}
