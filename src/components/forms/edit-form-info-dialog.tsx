"use client";

import { useState, useEffect } from "react";
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
	const { selectedForm, updateForm } = useFormStore();
	const { t } = useLanguage();
	const [isSaving, setIsSaving] = useState(false);

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [tags, setTags] = useState("");

	// Sync with selected form when dialog opens
	useEffect(() => {
		if (open && selectedForm) {
			setName(selectedForm.name);
			setDescription(selectedForm.description ?? "");
			setTags(selectedForm.tags.join(", "));
		}
	}, [open, selectedForm]);

	if (!selectedForm) return null;

	const hasChanges =
		name.trim() !== selectedForm.name ||
		description.trim() !== (selectedForm.description ?? "") ||
		tags.trim() !== selectedForm.tags.join(", ");

	const handleSave = async () => {
		if (!name.trim()) return;
		setIsSaving(true);
		try {
			await updateForm(selectedForm.id, {
				name: name.trim(),
				description: description.trim() || undefined,
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
						<Label htmlFor="edit-form-name">{t("createForm.formName")}</Label>
						<Input
							id="edit-form-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={t("createForm.formNamePlaceholder")}
							className="mt-1"
						/>
					</div>

					<div>
						<Label htmlFor="edit-form-description">
							{t("createForm.descriptionLabel")}
						</Label>
						<Textarea
							id="edit-form-description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder={t("createForm.descriptionPlaceholder")}
							className="mt-1"
							rows={3}
						/>
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
						disabled={!name.trim() || !hasChanges || isSaving}
					>
						{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{t("common.save")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
