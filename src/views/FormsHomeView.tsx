"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/lib/form-store";
import { useLanguage } from "@/components/LanguageProvider";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import { FormsList } from "@/components/forms/forms-list";
import { FormDetail } from "@/components/forms/form-detail";
import { FormEditor } from "@/components/forms/form-editor";
import { CreateFormDialog } from "@/components/forms/create-form-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher, ThemeSwitcher } from "@janovix/blocks";
import { Plus, User, LogOut } from "lucide-react";
import { getAuthAppUrl } from "@/lib/auth/config";

type ViewState = "list" | "detail" | "editor";

const languages = [
	{ key: "en", label: "EN", nativeName: "English" },
	{ key: "es", label: "ES", nativeName: "Español" },
];

export function FormsHomeView() {
	const router = useRouter();
	const { data: session } = useAuthSession();
	const { setSelectedForm, createForm, startEditing, cancelEditing } =
		useFormStore();
	const { t, language, setLanguage } = useLanguage();
	const [view, setView] = useState<ViewState>("list");
	const [showCreateDialog, setShowCreateDialog] = useState(false);

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

	const handleCreateForm = (name: string, description: string) => {
		createForm(name, description);
		const forms = useFormStore.getState().forms;
		const newForm = forms[0]; // New form is added at the beginning
		if (newForm) {
			setSelectedForm(newForm.id);
			startEditing(newForm);
			setView("editor");
		}
	};

	const handleSave = () => {
		setView("detail");
	};

	const handleLogout = () => {
		// Redirect to auth app logout
		window.location.href = `${getAuthAppUrl()}/logout`;
	};

	return (
		<div className="flex flex-col h-screen">
			{/* Header */}
			<header className="border-b bg-background px-6 py-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<h1 className="text-xl font-semibold">{t("app.title")}</h1>
						{view === "list" && (
							<Button
								onClick={() => setShowCreateDialog(true)}
								size="sm"
								className="gap-2"
							>
								<Plus className="h-4 w-4" />
								{t("formsList.createForm")}
							</Button>
						)}
					</div>

					<div className="flex items-center gap-3">
						<LanguageSwitcher
							languages={languages}
							currentLanguage={language}
							onLanguageChange={(key) => setLanguage(key as "en" | "es")}
							labels={{ language: t("languageToggle") }}
							showIcon
						/>
						<ThemeSwitcher
							labels={{
								theme: t("themeToggle"),
								light: t("themeLight"),
								dark: t("themeDark"),
								system: t("themeSystem"),
							}}
						/>

						{session && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="relative h-10 w-10 rounded-full"
									>
										<Avatar className="h-10 w-10">
											<AvatarImage
												src={session.user.image || undefined}
												alt={session.user.name}
											/>
											<AvatarFallback>
												{session.user.name
													?.split(" ")
													.map((n) => n[0])
													.join("")
													.toUpperCase() || "U"}
											</AvatarFallback>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56" align="end">
									<div className="flex items-center gap-2 p-2">
										<Avatar className="h-8 w-8">
											<AvatarImage
												src={session.user.image || undefined}
												alt={session.user.name}
											/>
											<AvatarFallback>
												{session.user.name
													?.split(" ")
													.map((n) => n[0])
													.join("")
													.toUpperCase() || "U"}
											</AvatarFallback>
										</Avatar>
										<div className="flex flex-col space-y-0.5">
											<p className="text-sm font-medium">{session.user.name}</p>
											<p className="text-xs text-muted-foreground">
												{session.user.email}
											</p>
										</div>
									</div>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<a
											href={`${getAuthAppUrl()}/account`}
											className="flex items-center gap-2 cursor-pointer"
										>
											<User className="h-4 w-4" />
											{t("userAccount")}
										</a>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={handleLogout}
										className="flex items-center gap-2 cursor-pointer text-destructive"
									>
										<LogOut className="h-4 w-4" />
										{t("userLogout")}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
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
