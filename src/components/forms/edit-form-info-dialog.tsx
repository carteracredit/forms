"use client";

import { useState, useEffect, useMemo } from "react";
import { useFormStore } from "@/lib/form-store";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EditFormInfoDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditFormInfoDialog({
	open,
	onOpenChange,
}: EditFormInfoDialogProps) {
	const { forms, selectedForm, updateForm } = useFormStore();
	const { t } = useLanguage();
	const [isSaving, setIsSaving] = useState(false);

	const [name, setName] = useState("");
	const [nameEs, setNameEs] = useState("");
	const [description, setDescription] = useState("");
	const [descriptionEs, setDescriptionEs] = useState("");
	const [tags, setTags] = useState("");

	useEffect(() => {
		if (open && selectedForm) {
			setName(selectedForm.name);
			setNameEs(selectedForm.nameEs ?? "");
			setDescription(selectedForm.description ?? "");
			setDescriptionEs(selectedForm.descriptionEs ?? "");
			setTags(selectedForm.tags.join(", "));
		}
	}, [open, selectedForm]);

	const isDuplicateName = useMemo(() => {
		if (!selectedForm) return false;
		const trimmed = name.trim().toLowerCase();
		if (!trimmed) return false;
		return forms.some(
			(f) => f.id !== selectedForm.id && f.name.toLowerCase() === trimmed,
		);
	}, [name, forms, selectedForm]);

	if (!selectedForm) return null;

	const hasChanges =
		name.trim() !== selectedForm.name ||
		(nameEs.trim() || "") !== (selectedForm.nameEs ?? "") ||
		description.trim() !== (selectedForm.description ?? "") ||
		(descriptionEs.trim() || "") !== (selectedForm.descriptionEs ?? "") ||
		tags.trim() !== selectedForm.tags.join(", ");

	const handleSave = async () => {
		if (!name.trim() || isDuplicateName) return;
		setIsSaving(true);
		try {
			await updateForm(selectedForm.id, {
				name: name.trim(),
				nameEs: nameEs.trim() || undefined,
				description: description.trim() || undefined,
				descriptionEs: descriptionEs.trim() || undefined,
				tags: tags
					.split(",")
					.map((t) => t.trim())
					.filter(Boolean),
			});
			toast.success(t("successUpdated"));
			onOpenChange(false);
		} catch {
			toast.error(t("errorGeneric"));
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("editFormInfo.title")}</DialogTitle>
					<DialogDescription>{t("editFormInfo.subtitle")}</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-2">
					<div>
						<Label htmlFor="edit-form-name">
							{t("createForm.formName")}
							<span className="ml-1 text-destructive">*</span>
						</Label>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
							<Input
								id="edit-form-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder={t("createForm.formNamePlaceholder")}
								className={isDuplicateName ? "border-destructive" : ""}
							/>
							<Input
								id="edit-form-name-es"
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
						{isDuplicateName && (
							<p className="text-sm text-destructive mt-1">
								{t("createForm.duplicateName")}
							</p>
						)}
					</div>

					<div>
						<Label htmlFor="edit-form-description">
							{t("createForm.descriptionLabel")}
						</Label>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
							<Textarea
								id="edit-form-description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder={t("createForm.descriptionPlaceholder")}
								rows={3}
							/>
							<Textarea
								id="edit-form-description-es"
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

					<div>
						<Label htmlFor="edit-form-tags">{t("editFormInfo.tags")}</Label>
						<Input
							id="edit-form-tags"
							value={tags}
							onChange={(e) => setTags(e.target.value)}
							placeholder={t("editFormInfo.tagsPlaceholder")}
							className="mt-1"
						/>
						<p className="mt-1 text-xs text-muted-foreground">
							{t("editFormInfo.tagsHint")}
						</p>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSaving}
					>
						{t("common.cancel")}
					</Button>
					<Button
						onClick={handleSave}
						disabled={
							!name.trim() || !hasChanges || isDuplicateName || isSaving
						}
					>
						{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{t("common.save")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
