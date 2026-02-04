"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/lib/form-store";
import { useLanguage } from "@/components/LanguageProvider";
import type { FormField, FormFieldType } from "@/lib/types/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { FormFieldRenderer } from "@/components/forms/form-field-renderer";
import {
	ArrowLeft,
	Plus,
	Trash2,
	GripVertical,
	Save,
	Eye,
	EyeOff,
	User,
	Phone,
	Mail,
	FileText,
	MapPin,
	Upload,
	CheckSquare,
	Circle,
	ListChecks,
	Calendar,
	Clock,
	Hash,
	Link,
	Lock,
	Star,
	AlignLeft,
	ChevronDown,
	Pencil,
} from "lucide-react";

const fieldTypes: {
	value: FormFieldType;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}[] = [
	{ value: "name", label: "Name Field", icon: User },
	{ value: "phone", label: "Phone Number", icon: Phone },
	{ value: "email", label: "Email Address", icon: Mail },
	{ value: "text", label: "Text Field", icon: FileText },
	{ value: "textarea", label: "Long Text", icon: AlignLeft },
	{ value: "number", label: "Number", icon: Hash },
	{ value: "url", label: "URL", icon: Link },
	{ value: "password", label: "Password", icon: Lock },
	{ value: "dropdown", label: "Dropdown", icon: ChevronDown },
	{ value: "date", label: "Date", icon: Calendar },
	{ value: "time", label: "Time", icon: Clock },
	{ value: "datetime", label: "Date & Time", icon: Clock },
	{ value: "rating", label: "Rating", icon: Star },
	{ value: "address", label: "Address Field", icon: MapPin },
	{ value: "file", label: "File Upload", icon: Upload },
	{ value: "checkbox", label: "Checkbox", icon: CheckSquare },
	{ value: "radio", label: "Radio Buttons", icon: Circle },
	{ value: "checkbox-group", label: "Checkbox Group", icon: ListChecks },
];

interface FormEditorProps {
	onBack: () => void;
	onSave: () => void;
}

export function FormEditor({ onBack, onSave }: FormEditorProps) {
	const router = useRouter();
	const { selectedForm, saveFormVersion } = useFormStore();
	const { t } = useLanguage();
	const [fields, setFields] = useState<FormField[]>([]);
	const [showAddField, setShowAddField] = useState(false);
	const [showSaveDialog, setShowSaveDialog] = useState(false);
	const [showLivePreview, setShowLivePreview] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [previewData, setPreviewData] = useState<Record<string, any>>({});
	const [changelog, setChangelog] = useState("");

	// New field form state
	const [newFieldType, setNewFieldType] = useState<FormFieldType>("name");
	const [newFieldLabel, setNewFieldLabel] = useState("");
	const [newFieldLabelEs, setNewFieldLabelEs] = useState("");
	const [newFieldPlaceholder, setNewFieldPlaceholder] = useState("");
	const [newFieldPlaceholderEs, setNewFieldPlaceholderEs] = useState("");
	const [newFieldRequired, setNewFieldRequired] = useState(false);
	const [newFieldOptions, setNewFieldOptions] = useState("");

	// Edit field state
	const [editingField, setEditingField] = useState<FormField | null>(null);
	const [showEditField, setShowEditField] = useState(false);

	// Drag and drop state
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
	const dragNode = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (selectedForm) {
			const currentVersion = selectedForm.versions.find(
				(v) => v.version === selectedForm.currentVersion,
			);
			if (currentVersion) {
				setFields(JSON.parse(JSON.stringify(currentVersion.fields)));
			}
		}
	}, [selectedForm]);

	if (!selectedForm) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-muted-foreground">
					{t("formEditor.noFormSelected")}
				</p>
			</div>
		);
	}

	const handleDragStart = (e: React.DragEvent, index: number) => {
		setDraggedIndex(index);
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", index.toString());
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		if (draggedIndex === null || draggedIndex === index) return;

		setDragOverIndex(index);
		const newFields = [...fields];
		const draggedField = newFields[draggedIndex];
		newFields.splice(draggedIndex, 1);
		newFields.splice(index, 0, draggedField);
		setFields(newFields);
		setDraggedIndex(index);
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
		setDragOverIndex(null);
	};

	const resetFieldForm = () => {
		setNewFieldType("name");
		setNewFieldLabel("");
		setNewFieldLabelEs("");
		setNewFieldPlaceholder("");
		setNewFieldPlaceholderEs("");
		setNewFieldRequired(false);
		setNewFieldOptions("");
	};

	const handleAddField = () => {
		if (!newFieldLabel.trim()) return;

		const newField: FormField = {
			id: `f${Date.now()}`,
			type: newFieldType,
			label: newFieldLabel,
			labelEs: newFieldLabelEs.trim() || undefined,
			placeholder: newFieldPlaceholder || undefined,
			placeholderEs: newFieldPlaceholderEs.trim() || undefined,
			required: newFieldRequired,
			options:
				["radio", "checkbox-group", "dropdown"].includes(newFieldType) &&
				newFieldOptions
					? newFieldOptions.split(",").map((o) => o.trim())
					: undefined,
		};

		setFields([...fields, newField]);
		resetFieldForm();
		setShowAddField(false);
	};

	const handleEditField = (field: FormField) => {
		setEditingField(field);
		setNewFieldType(field.type);
		setNewFieldLabel(field.label);
		setNewFieldLabelEs(field.labelEs || "");
		setNewFieldPlaceholder(field.placeholder || "");
		setNewFieldPlaceholderEs(field.placeholderEs || "");
		setNewFieldRequired(field.required || false);
		setNewFieldOptions(field.options?.join(", ") || "");
		setShowEditField(true);
	};

	const handleUpdateField = () => {
		if (!newFieldLabel.trim() || !editingField) return;

		const updatedField: FormField = {
			...editingField,
			type: newFieldType,
			label: newFieldLabel,
			labelEs: newFieldLabelEs.trim() || undefined,
			placeholder: newFieldPlaceholder || undefined,
			placeholderEs: newFieldPlaceholderEs.trim() || undefined,
			required: newFieldRequired,
			options:
				["radio", "checkbox-group", "dropdown"].includes(newFieldType) &&
				newFieldOptions
					? newFieldOptions.split(",").map((o) => o.trim())
					: undefined,
		};

		setFields(fields.map((f) => (f.id === editingField.id ? updatedField : f)));
		resetFieldForm();
		setShowEditField(false);
		setEditingField(null);
	};

	const handleDeleteField = (fieldId: string) => {
		setFields(fields.filter((f) => f.id !== fieldId));
	};

	const handleSaveVersion = () => {
		if (!changelog.trim()) return;
		saveFormVersion(selectedForm.id, fields, changelog);
		setShowSaveDialog(false);
		setChangelog("");
		onSave();
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handlePreviewChange = (fieldId: string, value: any) => {
		setPreviewData((prev) => ({ ...prev, [fieldId]: value }));
	};

	const FieldIcon = ({ type }: { type: FormFieldType }) => {
		const fieldType = fieldTypes.find((f) => f.value === type);
		if (!fieldType) return null;
		const IconComponent = fieldType.icon;
		return <IconComponent className="h-4 w-4" />;
	};

	const renderFieldForm = (isEdit: boolean) => (
		<div className="space-y-4 py-4">
			<div>
				<Label>{t("formEditor.fieldType")}</Label>
				<Select
					value={newFieldType}
					onValueChange={(val) => setNewFieldType(val as FormFieldType)}
				>
					<SelectTrigger className="mt-1">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{fieldTypes.map((type) => (
							<SelectItem key={type.value} value={type.value}>
								<span className="flex items-center gap-2">
									<type.icon className="h-4 w-4" />
									{type.label}
								</span>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div>
				<Label>{t("formEditor.bilingualLabel")}</Label>
				<div className="grid grid-cols-2 gap-2 mt-1">
					<Input
						value={newFieldLabel}
						onChange={(e) => setNewFieldLabel(e.target.value)}
						placeholder={t("formEditor.enterLabelEn")}
					/>
					<Input
						value={newFieldLabelEs}
						onChange={(e) => setNewFieldLabelEs(e.target.value)}
						placeholder={t("formEditor.enterLabelEs")}
					/>
				</div>
			</div>

			<div>
				<Label>{t("formEditor.bilingualPlaceholder")}</Label>
				<div className="grid grid-cols-2 gap-2 mt-1">
					<Input
						value={newFieldPlaceholder}
						onChange={(e) => setNewFieldPlaceholder(e.target.value)}
						placeholder={t("formEditor.enterPlaceholderEn")}
					/>
					<Input
						value={newFieldPlaceholderEs}
						onChange={(e) => setNewFieldPlaceholderEs(e.target.value)}
						placeholder={t("formEditor.enterPlaceholderEs")}
					/>
				</div>
			</div>

			{["radio", "checkbox-group", "dropdown"].includes(newFieldType) && (
				<div>
					<Label>{t("fieldProperties.optionsComma")}</Label>
					<Input
						value={newFieldOptions}
						onChange={(e) => setNewFieldOptions(e.target.value)}
						placeholder={t("fieldProperties.optionsPlaceholder")}
						className="mt-1"
					/>
				</div>
			)}

			<div className="flex items-center justify-between">
				<Label>{t("common.required")}</Label>
				<Switch
					checked={newFieldRequired}
					onCheckedChange={setNewFieldRequired}
				/>
			</div>
		</div>
	);

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="border-b bg-background px-4 md:px-6 py-3 md:py-4">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
					<div className="flex items-center gap-2 md:gap-4">
						<Button
							variant="ghost"
							size="sm"
							onClick={onBack}
							className="gap-2 px-2 md:px-3"
						>
							<ArrowLeft className="h-4 w-4" />
							<span className="hidden sm:inline">{t("common.cancel")}</span>
						</Button>
						<Separator orientation="vertical" className="h-6 hidden sm:block" />
						<div className="min-w-0">
							<h1 className="text-lg md:text-2xl font-semibold text-foreground truncate">
								{t("formEditor.editForm")}
							</h1>
							<p className="text-xs md:text-sm text-muted-foreground truncate">
								{selectedForm.name}
							</p>
						</div>
					</div>
					<div className="flex gap-2 flex-wrap">
						<Button
							variant="outline"
							onClick={() => setShowLivePreview(!showLivePreview)}
							className="gap-2 flex-1 sm:flex-none"
							size="sm"
						>
							{showLivePreview ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
							<span className="hidden md:inline">
								{showLivePreview
									? t("formEditor.hidePreview")
									: t("formEditor.showPreview")}
							</span>
						</Button>
						<Button
							variant="outline"
							onClick={() => router.push(`/preview/${selectedForm.id}`)}
							className="gap-2 flex-1 sm:flex-none"
							size="sm"
						>
							<Eye className="h-4 w-4" />
							<span className="hidden md:inline">
								{t("formEditor.fullPreview")}
							</span>
						</Button>
						<Button
							onClick={() => setShowSaveDialog(true)}
							className="gap-2 flex-1 sm:flex-none"
							size="sm"
						>
							<Save className="h-4 w-4" />
							<span className="hidden md:inline">
								{t("formEditor.saveVersion")}
							</span>
						</Button>
					</div>
				</div>
				<Badge
					variant="outline"
					className="bg-amber-100 text-amber-700 border-amber-200"
				>
					{t("formEditor.unsavedChanges")}
				</Badge>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
				<div
					className={`flex-1 overflow-auto ${showLivePreview ? "lg:border-r" : ""}`}
				>
					<div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
						{/* Field List */}
						<Card className="p-4 md:p-6">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-lg font-semibold">
									{t("formDetail.formFields")}
								</h2>
								<Button
									onClick={() => setShowAddField(true)}
									size="sm"
									className="gap-2"
								>
									<Plus className="h-4 w-4" />
									<span className="hidden sm:inline">
										{t("formEditor.addField")}
									</span>
								</Button>
							</div>

							{fields.length === 0 ? (
								<div className="text-center py-12 border-2 border-dashed rounded-lg">
									<p className="text-muted-foreground mb-4">
										{t("formDetail.noFieldsYet")}
									</p>
									<Button
										onClick={() => setShowAddField(true)}
										variant="outline"
										className="gap-2"
									>
										<Plus className="h-4 w-4" />
										{t("formEditor.addField")}
									</Button>
								</div>
							) : (
								<div className="space-y-3">
									{fields.map((field, index) => (
										<Card
											key={field.id}
											ref={index === draggedIndex ? dragNode : null}
											draggable
											onDragStart={(e) => handleDragStart(e, index)}
											onDragOver={(e) => handleDragOver(e, index)}
											onDragEnd={handleDragEnd}
											className={`transition-all duration-200 ${
												draggedIndex === index ? "opacity-50 scale-[0.98]" : ""
											} ${dragOverIndex === index && draggedIndex !== index ? "border-primary" : ""}`}
										>
											<div className="p-3 md:p-4">
												<div className="flex items-start gap-2 md:gap-3">
													<div
														className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-muted rounded mt-0.5 touch-none"
														onMouseDown={(e) => e.stopPropagation()}
													>
														<GripVertical className="h-4 w-4 text-muted-foreground" />
													</div>

													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2 mb-3 flex-wrap">
															<div className="flex items-center gap-2 text-muted-foreground">
																<FieldIcon type={field.type} />
																<Badge className="text-xs bg-teal-500/20 text-teal-700 dark:text-teal-300 hover:bg-teal-500/30 border-teal-500/30">
																	{
																		fieldTypes.find(
																			(f) => f.value === field.type,
																		)?.label
																	}
																</Badge>
															</div>
															{field.required && (
																<Badge
																	variant="outline"
																	className="text-xs bg-red-50 text-red-600 border-red-200"
																>
																	{t("common.required")}
																</Badge>
															)}
														</div>

														<div className="bg-muted/30 rounded-lg p-3 md:p-4 border">
															<FormFieldRenderer
																field={field}
																value={previewData[field.id]}
																onChange={handlePreviewChange}
																compact
															/>
														</div>
													</div>

													<div className="flex gap-1">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleEditField(field)}
															className="h-8 w-8 p-0"
														>
															<Pencil className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleDeleteField(field.id)}
															className="h-8 w-8 p-0 text-destructive hover:text-destructive"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</div>
											</div>
										</Card>
									))}
								</div>
							)}
						</Card>
					</div>
				</div>

				{/* Live Preview Panel */}
				{showLivePreview && (
					<div className="w-full lg:w-[400px] border-t lg:border-t-0 overflow-auto bg-muted/20">
						<div className="p-4 md:p-6">
							<h3 className="text-lg font-semibold mb-4">
								{t("formEditor.livePreview")}
							</h3>
							<Card className="p-6">
								{fields.length === 0 ? (
									<p className="text-muted-foreground text-center py-8">
										{t("formDetail.noFieldsYet")}
									</p>
								) : (
									<div className="space-y-6">
										{fields.map((field) => (
											<FormFieldRenderer
												key={field.id}
												field={field}
												value={previewData[field.id]}
												onChange={handlePreviewChange}
											/>
										))}
									</div>
								)}
							</Card>
						</div>
					</div>
				)}
			</div>

			{/* Add Field Dialog */}
			<Dialog open={showAddField} onOpenChange={setShowAddField}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("formEditor.addNewField")}</DialogTitle>
					</DialogHeader>
					{renderFieldForm(false)}
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowAddField(false);
								resetFieldForm();
							}}
						>
							{t("common.cancel")}
						</Button>
						<Button onClick={handleAddField} disabled={!newFieldLabel.trim()}>
							{t("formEditor.addField")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Field Dialog */}
			<Dialog open={showEditField} onOpenChange={setShowEditField}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("formEditor.editField")}</DialogTitle>
					</DialogHeader>
					{renderFieldForm(true)}
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowEditField(false);
								resetFieldForm();
								setEditingField(null);
							}}
						>
							{t("common.cancel")}
						</Button>
						<Button
							onClick={handleUpdateField}
							disabled={!newFieldLabel.trim()}
						>
							{t("common.save")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Save Version Dialog */}
			<Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("formEditor.saveNewVersion")}</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div>
							<Label>{t("formEditor.changelog")}</Label>
							<Textarea
								value={changelog}
								onChange={(e) => setChangelog(e.target.value)}
								placeholder={t("formEditor.changelogPlaceholder")}
								className="mt-1"
								rows={4}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowSaveDialog(false);
								setChangelog("");
							}}
						>
							{t("common.cancel")}
						</Button>
						<Button onClick={handleSaveVersion} disabled={!changelog.trim()}>
							{t("formEditor.saveVersion")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
