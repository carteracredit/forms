"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/lib/form-store";
import { useLanguage } from "@/components/LanguageProvider";
import { FormsList } from "@/components/forms/forms-list";
import { CreateFormDialog } from "@/components/forms/create-form-dialog";
import { SessionControls } from "@/components/SessionControls";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function FormsHomeView() {
	const { forms, createForm, fetchForms, isLoading, error } = useFormStore();
	const { t } = useLanguage();
	const router = useRouter();
	const [showCreateDialog, setShowCreateDialog] = useState(false);

	useEffect(() => {
		fetchForms();
	}, [fetchForms]);

	useEffect(() => {
		if (error) {
			toast.error(error);
		}
	}, [error]);

	const handleViewForm = (formId: string) => {
		router.push(`/${formId}`);
	};

	const handleEditForm = (formId: string) => {
		router.push(`/${formId}/editor`);
	};

	const handleCreateForm = async (payload: {
		name: string;
		nameEs?: string;
		description?: string;
		descriptionEs?: string;
	}) => {
		try {
			const newForm = await createForm(payload);
			router.push(`/${newForm.id}?tab=fieldLibrary`);
		} catch {
			// Error is already set in store and toasted via useEffect
		}
	};

	const existingFormNames = useMemo(() => forms.map((f) => f.name), [forms]);

	return (
		<div className="min-h-screen bg-background">
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

			<CreateFormDialog
				open={showCreateDialog}
				onOpenChange={setShowCreateDialog}
				onCreateForm={handleCreateForm}
				existingFormNames={existingFormNames}
			/>
		</div>
	);
}
