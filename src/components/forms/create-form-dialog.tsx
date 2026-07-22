"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/components/LanguageProvider";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export interface CreateFormPayload {
	name: string;
	nameEs?: string;
	description?: string;
	descriptionEs?: string;
}

interface CreateFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreateForm: (payload: CreateFormPayload) => void;
	existingFormNames?: string[];
}

export function CreateFormDialog({
	open,
	onOpenChange,
	onCreateForm,
	existingFormNames = [],
}: CreateFormDialogProps) {
	const [name, setName] = useState("");
	const [nameEs, setNameEs] = useState("");
	const [description, setDescription] = useState("");
	const [descriptionEs, setDescriptionEs] = useState("");
	const { t } = useLanguage();

	const isDuplicate = useMemo(() => {
		const trimmed = name.trim().toLowerCase();
		if (!trimmed) return false;
		return existingFormNames.some((n) => n.toLowerCase() === trimmed);
	}, [name, existingFormNames]);

	const handleCreate = () => {
		if (!name.trim() || isDuplicate) return;
		onCreateForm({
			name: name.trim(),
			nameEs: nameEs.trim() || undefined,
			description: description.trim() || undefined,
			descriptionEs: descriptionEs.trim() || undefined,
		});
		setName("");
		setNameEs("");
		setDescription("");
		setDescriptionEs("");
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("createForm.title")}</DialogTitle>
					<DialogDescription>{t("createForm.subtitle")}</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div>
						<Label htmlFor="name">
							{t("createForm.formName")}
							<span className="ml-1 text-destructive">*</span>
						</Label>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder={t("createForm.formNamePlaceholder")}
								className={isDuplicate ? "border-destructive" : ""}
							/>
							<Input
								id="name-es"
								value={nameEs}
								onChange={(e) => setNameEs(e.target.value)}
								placeholder={t("createForm.formNameEsPlaceholder")}
							/>
						</div>
						<div className="hidden sm:grid grid-cols-2 gap-2">
							<span className="text-[10px] text-muted-foreground">
								{t("formEditor.english")}
							</span>
							<span className="text-[10px] text-muted-foreground">
								{t("formEditor.spanish")}
							</span>
						</div>
						{isDuplicate && (
							<p className="text-sm text-destructive mt-1">
								{t("createForm.duplicateName")}
							</p>
						)}
					</div>

					<div>
						<Label htmlFor="description">
							{t("createForm.descriptionLabel")}
						</Label>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder={t("createForm.descriptionPlaceholder")}
								rows={3}
							/>
							<Textarea
								id="description-es"
								value={descriptionEs}
								onChange={(e) => setDescriptionEs(e.target.value)}
								placeholder={t("createForm.descriptionEsPlaceholder")}
								rows={3}
							/>
						</div>
						<div className="hidden sm:grid grid-cols-2 gap-2">
							<span className="text-[10px] text-muted-foreground">
								{t("formEditor.english")}
							</span>
							<span className="text-[10px] text-muted-foreground">
								{t("formEditor.spanish")}
							</span>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{t("common.cancel")}
					</Button>
					<Button onClick={handleCreate} disabled={!name.trim() || isDuplicate}>
						{t("createForm.title")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
