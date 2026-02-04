"use client";

import { useState } from "react";
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

interface CreateFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreateForm: (name: string, description: string) => void;
}

export function CreateFormDialog({
	open,
	onOpenChange,
	onCreateForm,
}: CreateFormDialogProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const { t } = useLanguage();

	const handleCreate = () => {
		if (!name.trim()) return;
		onCreateForm(name, description);
		setName("");
		setDescription("");
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
						<Label htmlFor="name">{t("createForm.formName")}</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={t("createForm.formNamePlaceholder")}
							className="mt-1"
						/>
					</div>

					<div>
						<Label htmlFor="description">
							{t("createForm.descriptionLabel")}
						</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder={t("createForm.descriptionPlaceholder")}
							className="mt-1"
							rows={4}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{t("common.cancel")}
					</Button>
					<Button onClick={handleCreate} disabled={!name.trim()}>
						{t("createForm.title")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
