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

	const handleViewForm = (formId: string) => {
		setSelectedForm(formId);
		setView("detail");
	};

	const handleEditForm = (formId: string) => {
		setSelectedForm(formId);
		const form = useFormStore.getState().forms.find((f) => f.id === formId);
		if (form) {
			startEditing(form);
			setView("editor");
		}
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
			startEditing(newForm);
			setView("editor");
		} catch {
			// Error is already set in store and toasted via useEffect
		}
	};

	const handleSave = () => {
		setView("detail");
	};

	return (
		<div className="flex flex-col h-screen">
			{/* Header */}
			<header className="border-b bg-background px-6 py-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Image
							src="/logo.svg"
							alt="Cartera Logo"
							width={32}
							height={32}
							className="h-8 w-8"
						/>
						<h1 className="text-xl font-semibold">{t("app.title")}</h1>
						{view === "list" && (
							<Button
								onClick={() => setShowCreateDialog(true)}
								size="sm"
								className="gap-2"
								disabled={isLoading}
							>
								{isLoading ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Plus className="h-4 w-4" />
								)}
								{t("formsList.createForm")}
							</Button>
						)}
					</div>

					<SessionControls />
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1 overflow-hidden">
				{view === "list" && (
					<FormsList onViewForm={handleViewForm} onEditForm={handleEditForm} />
				)}
				{view === "detail" && (
					<FormDetail
						onBack={handleBack}
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
			</main>

			{/* Create Form Dialog */}
			<CreateFormDialog
				open={showCreateDialog}
				onOpenChange={setShowCreateDialog}
				onCreateForm={handleCreateForm}
			/>
		</div>
	);
}
