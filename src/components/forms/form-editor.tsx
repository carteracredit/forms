"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/lib/form-store";
import { useLanguage } from "@/components/LanguageProvider";
import type { FormField, FormFieldType } from "@/lib/types/form";
import { normalizeFieldsForChecksum } from "@/lib/checksum";
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
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FormFieldRenderer } from "@/components/forms/form-field-renderer";
import { SessionControls } from "@/components/SessionControls";
import { computeFieldsChecksum } from "@/lib/checksum";
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
	ChevronRight,
	Code,
	Pencil,
	Rocket,
	RefreshCw,
	Loader2,
} from "lucide-react";
import { toast } from "sonner";

function getFieldTypes(t: (key: string) => string): {
	value: FormFieldType;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}[] {
	return [
		{ value: "name", label: t("fieldTypes.name"), icon: User },
		{ value: "phone", label: t("fieldTypes.phone"), icon: Phone },
		{ value: "email", label: t("fieldTypes.email"), icon: Mail },
		{ value: "text", label: t("fieldTypes.text"), icon: FileText },
		{ value: "textarea", label: t("fieldTypes.textarea"), icon: AlignLeft },
		{ value: "number", label: t("fieldTypes.number"), icon: Hash },
		{ value: "url", label: t("fieldTypes.url"), icon: Link },
		{ value: "password", label: t("fieldTypes.password"), icon: Lock },
		{ value: "dropdown", label: t("fieldTypes.dropdown"), icon: ChevronDown },
		{ value: "date", label: t("fieldTypes.date"), icon: Calendar },
		{ value: "time", label: t("fieldTypes.time"), icon: Clock },
		{ value: "datetime", label: t("fieldTypes.datetime"), icon: Clock },
		{ value: "rating", label: t("fieldTypes.rating"), icon: Star },
		{ value: "address", label: t("fieldTypes.address"), icon: MapPin },
		{ value: "file", label: t("fieldTypes.file"), icon: Upload },
		{ value: "checkbox", label: t("fieldTypes.checkbox"), icon: CheckSquare },
		{ value: "radio", label: t("fieldTypes.radio"), icon: Circle },
		{
			value: "checkbox-group",
			label: t("fieldTypes.checkbox-group"),
			icon: ListChecks,
		},
	];
}

/** Returns example input/output schema for a field (for preview only). */
function getFieldSchemaPreview(field: FormField): {
	input: Record<string, unknown>;
	output: Record<string, unknown>;
} {
	const input: Record<string, unknown> = {};
	const output: Record<string, unknown> = {};
	switch (field.type) {
		case "name":
			input.firstName = "John";
			if (field.properties?.includeMiddleName) input.middleName = "M.";
			input.lastName = "Doe";
			output.firstName = "string";
			if (field.properties?.includeMiddleName) output.middleName = "string";
			output.lastName = "string";
			output.fullName = "string";
			break;
		case "phone":
			input.phone = "+14155552671";
			output.phone = "string";
			break;
		case "email":
			input.email = "user@example.com";
			output.email = "string";
			break;
		case "text":
		case "textarea":
			input.defaultText = "string";
			output.text = "string";
			break;
		case "number":
			input.value = 0;
			output.value = "number";
			break;
		case "url":
			input.url = "https://example.com";
			output.url = "string";
			break;
		case "password":
			output.value = "string";
			break;
		case "dropdown":
		case "radio":
			input.selectedValue = field.options?.[0] ?? "string";
			output.value = "string";
			break;
		case "checkbox-group":
			input.selectedOptions = [];
			output.selected = "string[]";
			break;
		case "address":
			input.street = "string";
			input.street2 = "string (optional)";
			input.city = "string";
			input.state = "string";
			input.zip = "string";
			input.country = "string";
			output.street = "string";
			output.street2 = "string (optional)";
			output.city = "string";
			output.state = "string";
			output.zip = "string";
			output.country = "string";
			output.fullAddress = "string";
			break;
		case "file":
			output.files = "array";
			break;
		case "checkbox":
			input.checked = false;
			output.checked = "boolean";
			break;
		case "date":
			input.date = "YYYY-MM-DD";
			output.date = "string (ISO)";
			break;
		case "time":
			input.time = "HH:mm";
			output.time = "string";
			break;
		case "datetime":
			input.datetime = "ISO8601";
			output.datetime = "string (ISO)";
			break;
		case "rating":
			input.rating = 0;
			output.rating = "number";
			break;
		default:
			output.value = "unknown";
	}
	return { input, output };
}

/** Returns list of property badge labels for a field (e.g. "min: 0", "rows: 4"). */
function getFieldPropertyBadges(field: FormField): string[] {
	const badges: string[] = [];
	if (field.validation?.minLength != null)
		badges.push(`minLen: ${field.validation.minLength}`);
	if (field.validation?.maxLength != null)
		badges.push(`maxLen: ${field.validation.maxLength}`);
	if (field.validation?.min != null)
		badges.push(`min: ${field.validation.min}`);
	if (field.validation?.max != null)
		badges.push(`max: ${field.validation.max}`);
	if (field.validation?.step != null)
		badges.push(`step: ${field.validation.step}`);
	if (field.properties?.rows != null)
		badges.push(`rows: ${field.properties.rows}`);
	if (field.properties?.maxRating != null)
		badges.push(`maxRating: ${field.properties.maxRating}`);
	if (field.properties?.allowHalf) badges.push("½ stars");
	if (field.properties?.showStrength) badges.push("strength");
	if (field.properties?.maxFileSize != null)
		badges.push(`maxMB: ${field.properties.maxFileSize}`);
	if (field.properties?.acceptedTypes?.length)
		badges.push(`types: ${field.properties.acceptedTypes.join(",")}`);
	if (field.properties?.dateMin)
		badges.push(`from: ${field.properties.dateMin}`);
	if (field.properties?.dateMax) badges.push(`to: ${field.properties.dateMax}`);
	if (field.properties?.includeMiddleName) badges.push("middle name");
	return badges;
}

interface FormEditorProps {
	formId: string;
}

export function FormEditor({ formId }: FormEditorProps) {
	const router = useRouter();
	const { selectedForm, saveFieldsDraft, publishForm, updateEditingFields } =
		useFormStore();
	const [isLoadingForm, setIsLoadingForm] = useState(() => {
		const state = useFormStore.getState();
		return !(state.isEditing && state.selectedForm?.id === formId);
	});
	const { t, getFieldLabel } = useLanguage();
	const fieldTypes = getFieldTypes(t);
	const [fields, setFields] = useState<FormField[]>([]);
	const [showAddField, setShowAddField] = useState(false);
	const [showPublishDialog, setShowPublishDialog] = useState(false);
	const [showLivePreview, setShowLivePreview] = useState(false);
	const [isSavingDraft, setIsSavingDraft] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [previewData, setPreviewData] = useState<Record<string, any>>({});

	// New field form state
	const [newFieldType, setNewFieldType] = useState<FormFieldType>("name");
	const [newFieldLabel, setNewFieldLabel] = useState("");
	const [newFieldLabelEs, setNewFieldLabelEs] = useState("");
	const [newFieldPlaceholder, setNewFieldPlaceholder] = useState("");
	const [newFieldPlaceholderEs, setNewFieldPlaceholderEs] = useState("");
	const [newFieldRequired, setNewFieldRequired] = useState(false);
	const [newFieldOptions, setNewFieldOptions] = useState("");
	const [newFieldOptionsEs, setNewFieldOptionsEs] = useState("");
	// Type-specific: password
	const [newFieldMinLength, setNewFieldMinLength] = useState<number | "">("");
	const [newFieldShowStrength, setNewFieldShowStrength] = useState(false);
	// Type-specific: number
	const [newFieldMin, setNewFieldMin] = useState<number | "">("");
	const [newFieldMax, setNewFieldMax] = useState<number | "">("");
	const [newFieldStep, setNewFieldStep] = useState<number | "">("");
	// Type-specific: textarea
	const [newFieldRows, setNewFieldRows] = useState<number | "">("");
	const [newFieldMaxLength, setNewFieldMaxLength] = useState<number | "">("");
	// Type-specific: rating
	const [newFieldMaxRating, setNewFieldMaxRating] = useState<number | "">("");
	const [newFieldAllowHalf, setNewFieldAllowHalf] = useState(false);
	// Type-specific: file
	const [newFieldAcceptedTypes, setNewFieldAcceptedTypes] = useState("");
	const [newFieldMaxFileSize, setNewFieldMaxFileSize] = useState<number | "">(
		"",
	);
	// Type-specific: date/datetime
	const [newFieldDateMin, setNewFieldDateMin] = useState("");
	const [newFieldDateMax, setNewFieldDateMax] = useState("");
	// Type-specific: time
	const [newFieldTimeStep, setNewFieldTimeStep] = useState<number | "">("");
	// Type-specific: name
	const [newFieldIncludeMiddleName, setNewFieldIncludeMiddleName] =
		useState(false);

	// Edit field state
	const [editingField, setEditingField] = useState<FormField | null>(null);
	const [showEditField, setShowEditField] = useState(false);

	// Drag and drop state
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
	const dragNode = useRef<HTMLDivElement | null>(null);

	// Expanded field for properties/schema view
	const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null);

	// Unsaved changes confirmation
	const [showLeaveDialog, setShowLeaveDialog] = useState(false);
	const [isSavingAndLeaving, setIsSavingAndLeaving] = useState(false);
	const pendingNavigationRef = useRef<string | null>(null);

	const savedFieldsRef = useRef<string>("");

	const hasUnsavedChanges = useMemo(
		() => normalizeFieldsForChecksum(fields) !== savedFieldsRef.current,
		[fields],
	);

	const confirmLeave = useCallback(() => {
		setShowLeaveDialog(false);
		useFormStore.getState().cancelEditing();
		if (pendingNavigationRef.current) {
			router.push(pendingNavigationRef.current);
			pendingNavigationRef.current = null;
		}
	}, [router]);

	const handleSaveAndLeave = useCallback(async () => {
		if (!selectedForm) return;
		setIsSavingAndLeaving(true);
		try {
			await saveFieldsDraft(selectedForm.id, fields);
			savedFieldsRef.current = normalizeFieldsForChecksum(fields);
			setShowLeaveDialog(false);
			useFormStore.getState().cancelEditing();
			if (pendingNavigationRef.current) {
				router.push(pendingNavigationRef.current);
				pendingNavigationRef.current = null;
			}
		} catch {
			toast.error(t("formEditor.saveDraftError"));
		} finally {
			setIsSavingAndLeaving(false);
		}
	}, [selectedForm, fields, saveFieldsDraft, router, t]);

	const requestLeave = useCallback(
		(path: string) => {
			if (hasUnsavedChanges) {
				pendingNavigationRef.current = path;
				setShowLeaveDialog(true);
			} else {
				useFormStore.getState().cancelEditing();
				router.push(path);
			}
		},
		[hasUnsavedChanges, router],
	);

	useEffect(() => {
		if (!hasUnsavedChanges) return;
		const handler = (e: BeforeUnloadEvent) => {
			e.preventDefault();
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [hasUnsavedChanges]);

	useEffect(() => {
		const load = async () => {
			const state = useFormStore.getState();

			if (state.isEditing && state.selectedForm?.id === formId) {
				const restoredFields: FormField[] = JSON.parse(
					JSON.stringify(state.editingFields),
				);
				setFields(restoredFields);
				savedFieldsRef.current = normalizeFieldsForChecksum(
					state.selectedForm.draftFields,
				);
				setIsLoadingForm(false);
				return;
			}

			setIsLoadingForm(true);
			await useFormStore.getState().refreshForm(formId);
			useFormStore.getState().setSelectedForm(formId);
			const form = useFormStore.getState().selectedForm;
			if (form) {
				useFormStore.getState().startEditing(form);
				setFields(JSON.parse(JSON.stringify(form.draftFields)));
				savedFieldsRef.current = normalizeFieldsForChecksum(form.draftFields);
			}
			setIsLoadingForm(false);
		};
		load();
	}, [formId]);

	if (isLoadingForm || !selectedForm) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
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
		setNewFieldOptionsEs("");
		setNewFieldMinLength("");
		setNewFieldShowStrength(false);
		setNewFieldMin("");
		setNewFieldMax("");
		setNewFieldStep("");
		setNewFieldRows("");
		setNewFieldMaxLength("");
		setNewFieldMaxRating("");
		setNewFieldAllowHalf(false);
		setNewFieldAcceptedTypes("");
		setNewFieldMaxFileSize("");
		setNewFieldDateMin("");
		setNewFieldDateMax("");
		setNewFieldTimeStep("");
		setNewFieldIncludeMiddleName(false);
	};

	const buildFieldFromForm = (id: string, existing?: FormField): FormField => {
		const isChoiceField = ["radio", "checkbox-group", "dropdown"].includes(
			newFieldType,
		);
		const options =
			isChoiceField && newFieldOptions
				? newFieldOptions.split(",").map((o) => o.trim())
				: undefined;

		let optionsEs: string[] | undefined;
		if (isChoiceField && options && newFieldOptionsEs.trim()) {
			const parsed = newFieldOptionsEs.split(",").map((o) => o.trim());
			const normalized = parsed.slice(0, options.length);
			while (normalized.length < options.length) normalized.push("");
			optionsEs = normalized.some((o) => o.length > 0) ? normalized : undefined;
		}

		const base: FormField = {
			id,
			type: newFieldType,
			label: newFieldLabel,
			labelEs: newFieldLabelEs.trim() || undefined,
			placeholder: newFieldPlaceholder || undefined,
			placeholderEs: newFieldPlaceholderEs.trim() || undefined,
			required: newFieldRequired,
			options,
			optionsEs,
		};

		const validation: FormField["validation"] = {};
		const properties: FormField["properties"] = {};

		if (newFieldType === "password") {
			if (newFieldMinLength !== "")
				validation.minLength = Number(newFieldMinLength);
			properties.showStrength = newFieldShowStrength;
		}
		if (newFieldType === "number") {
			if (newFieldMin !== "") validation.min = Number(newFieldMin);
			if (newFieldMax !== "") validation.max = Number(newFieldMax);
			if (newFieldStep !== "") validation.step = Number(newFieldStep);
		}
		if (newFieldType === "textarea") {
			if (newFieldRows !== "") properties.rows = Number(newFieldRows);
			if (newFieldMaxLength !== "")
				validation.maxLength = Number(newFieldMaxLength);
		}
		if (newFieldType === "rating") {
			if (newFieldMaxRating !== "")
				properties.maxRating = Number(newFieldMaxRating);
			properties.allowHalf = newFieldAllowHalf;
		}
		if (newFieldType === "file") {
			if (newFieldAcceptedTypes.trim())
				properties.acceptedTypes = newFieldAcceptedTypes
					.split(",")
					.map((s) => s.trim())
					.filter(Boolean);
			if (newFieldMaxFileSize !== "")
				properties.maxFileSize = Number(newFieldMaxFileSize);
		}
		if (newFieldType === "date" || newFieldType === "datetime") {
			if (newFieldDateMin.trim()) properties.dateMin = newFieldDateMin;
			if (newFieldDateMax.trim()) properties.dateMax = newFieldDateMax;
		}
		if (newFieldType === "time" && newFieldTimeStep !== "") {
			validation.step = Number(newFieldTimeStep);
		}
		if (newFieldType === "name") {
			properties.includeMiddleName = newFieldIncludeMiddleName;
		}

		if (Object.keys(validation).length > 0) base.validation = validation;
		if (Object.keys(properties).length > 0) base.properties = properties;
		return base;
	};

	const isFieldLabelDuplicate = (label: string, excludeFieldId?: string) => {
		const trimmed = label.trim().toLowerCase();
		if (!trimmed) return false;
		return fields.some(
			(f) => f.id !== excludeFieldId && f.label.toLowerCase() === trimmed,
		);
	};

	const handleAddField = () => {
		if (!newFieldLabel.trim()) return;
		if (isFieldLabelDuplicate(newFieldLabel)) {
			toast.error(t("formEditor.duplicateFieldLabel"));
			return;
		}

		const newField = buildFieldFromForm(`f${Date.now()}`);
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
		setNewFieldOptionsEs(field.optionsEs?.join(", ") || "");
		setNewFieldMinLength(field.validation?.minLength ?? "");
		setNewFieldShowStrength(field.properties?.showStrength ?? false);
		setNewFieldMin(field.validation?.min ?? "");
		setNewFieldMax(field.validation?.max ?? "");
		setNewFieldStep(field.validation?.step ?? "");
		setNewFieldRows(field.properties?.rows ?? "");
		setNewFieldMaxLength(field.validation?.maxLength ?? "");
		setNewFieldMaxRating(field.properties?.maxRating ?? "");
		setNewFieldAllowHalf(field.properties?.allowHalf ?? false);
		setNewFieldAcceptedTypes(field.properties?.acceptedTypes?.join(", ") ?? "");
		setNewFieldMaxFileSize(field.properties?.maxFileSize ?? "");
		setNewFieldDateMin(field.properties?.dateMin ?? "");
		setNewFieldDateMax(field.properties?.dateMax ?? "");
		setNewFieldTimeStep(
			field.type === "time" ? (field.validation?.step ?? "") : "",
		);
		setNewFieldIncludeMiddleName(field.properties?.includeMiddleName ?? false);
		setShowEditField(true);
	};

	const handleUpdateField = () => {
		if (!newFieldLabel.trim() || !editingField) return;
		if (isFieldLabelDuplicate(newFieldLabel, editingField.id)) {
			toast.error(t("formEditor.duplicateFieldLabel"));
			return;
		}

		const updatedField = buildFieldFromForm(editingField.id, editingField);
		setFields(fields.map((f) => (f.id === editingField.id ? updatedField : f)));
		resetFieldForm();
		setShowEditField(false);
		setEditingField(null);
	};

	const handleDeleteField = (fieldId: string) => {
		setFields(fields.filter((f) => f.id !== fieldId));
	};

	const handleSaveDraft = async () => {
		if (!selectedForm) return;
		setIsSavingDraft(true);
		try {
			// Checksum: skip if fields identical to current draft
			const [currentChecksum, newChecksum] = await Promise.all([
				computeFieldsChecksum(selectedForm.draftFields),
				computeFieldsChecksum(fields),
			]);
			if (currentChecksum === newChecksum) {
				toast.info(t("formEditor.noChanges"), {
					description: t("formEditor.noChangesDesc"),
				});
				return;
			}
			await saveFieldsDraft(selectedForm.id, fields);
			savedFieldsRef.current = normalizeFieldsForChecksum(fields);
			toast.success(t("formEditor.draftSaved"));
		} catch {
			toast.error(t("formEditor.saveDraftError"));
		} finally {
			setIsSavingDraft(false);
		}
	};

	const handlePublish = async () => {
		if (!selectedForm) return;
		setIsPublishing(true);
		try {
			await saveFieldsDraft(selectedForm.id, fields);
			await publishForm(selectedForm.id);
			toast.success(t("formEditor.published"));
			setShowPublishDialog(false);
			useFormStore.getState().cancelEditing();
			router.push(`/${formId}`);
		} catch {
			toast.error(t("formEditor.publishError"));
		} finally {
			setIsPublishing(false);
		}
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
						className={
							isFieldLabelDuplicate(
								newFieldLabel,
								isEdit ? editingField?.id : undefined,
							)
								? "border-destructive"
								: ""
						}
					/>
					<Input
						value={newFieldLabelEs}
						onChange={(e) => setNewFieldLabelEs(e.target.value)}
						placeholder={t("formEditor.enterLabelEs")}
					/>
				</div>
				{isFieldLabelDuplicate(
					newFieldLabel,
					isEdit ? editingField?.id : undefined,
				) && (
					<p className="text-sm text-destructive mt-1">
						{t("formEditor.duplicateFieldLabel")}
					</p>
				)}
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

			{newFieldType === "name" && (
				<div className="flex items-center justify-between">
					<Label>{t("fieldProperties.includeMiddleName")}</Label>
					<Switch
						checked={newFieldIncludeMiddleName}
						onCheckedChange={setNewFieldIncludeMiddleName}
					/>
				</div>
			)}

			{["radio", "checkbox-group", "dropdown"].includes(newFieldType) && (
				<div>
					<Label>{t("fieldProperties.optionsComma")}</Label>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
						<Input
							value={newFieldOptions}
							onChange={(e) => setNewFieldOptions(e.target.value)}
							placeholder={t("fieldProperties.optionsPlaceholder")}
						/>
						<Input
							value={newFieldOptionsEs}
							onChange={(e) => setNewFieldOptionsEs(e.target.value)}
							placeholder={t("fieldProperties.optionsEsPlaceholder")}
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
			)}

			{newFieldType === "password" && (
				<>
					<div>
						<Label>{t("fieldProperties.minLength")}</Label>
						<Input
							type="number"
							min={0}
							value={newFieldMinLength === "" ? "" : newFieldMinLength}
							onChange={(e) =>
								setNewFieldMinLength(
									e.target.value === "" ? "" : Number(e.target.value),
								)
							}
							placeholder="8"
							className="mt-1"
						/>
					</div>
					<div className="flex items-center justify-between">
						<Label>{t("fieldProperties.showStrength")}</Label>
						<Switch
							checked={newFieldShowStrength}
							onCheckedChange={setNewFieldShowStrength}
						/>
					</div>
				</>
			)}

			{newFieldType === "number" && (
				<div className="grid grid-cols-3 gap-2">
					<div>
						<Label>{t("fieldProperties.min")}</Label>
						<Input
							type="number"
							value={newFieldMin === "" ? "" : newFieldMin}
							onChange={(e) =>
								setNewFieldMin(
									e.target.value === "" ? "" : Number(e.target.value),
								)
							}
							className="mt-1"
						/>
					</div>
					<div>
						<Label>{t("fieldProperties.max")}</Label>
						<Input
							type="number"
							value={newFieldMax === "" ? "" : newFieldMax}
							onChange={(e) =>
								setNewFieldMax(
									e.target.value === "" ? "" : Number(e.target.value),
								)
							}
							className="mt-1"
						/>
					</div>
					<div>
						<Label>{t("fieldProperties.step")}</Label>
						<Input
							type="number"
							value={newFieldStep === "" ? "" : newFieldStep}
							onChange={(e) =>
								setNewFieldStep(
									e.target.value === "" ? "" : Number(e.target.value),
								)
							}
							className="mt-1"
						/>
					</div>
				</div>
			)}

			{newFieldType === "textarea" && (
				<div className="grid grid-cols-2 gap-2">
					<div>
						<Label>{t("fieldProperties.rows")}</Label>
						<Input
							type="number"
							min={1}
							value={newFieldRows === "" ? "" : newFieldRows}
							onChange={(e) =>
								setNewFieldRows(
									e.target.value === "" ? "" : Number(e.target.value),
								)
							}
							className="mt-1"
						/>
					</div>
					<div>
						<Label>{t("fieldProperties.maxLength")}</Label>
						<Input
							type="number"
							min={0}
							value={newFieldMaxLength === "" ? "" : newFieldMaxLength}
							onChange={(e) =>
								setNewFieldMaxLength(
									e.target.value === "" ? "" : Number(e.target.value),
								)
							}
							className="mt-1"
						/>
					</div>
				</div>
			)}

			{newFieldType === "rating" && (
				<>
					<div>
						<Label>{t("fieldProperties.maxRating")}</Label>
						<Input
							type="number"
							min={1}
							max={10}
							value={newFieldMaxRating === "" ? "" : newFieldMaxRating}
							onChange={(e) =>
								setNewFieldMaxRating(
									e.target.value === "" ? "" : Number(e.target.value),
								)
							}
							placeholder="5"
							className="mt-1"
						/>
					</div>
					<div className="flex items-center justify-between">
						<Label>{t("fieldProperties.allowHalf")}</Label>
						<Switch
							checked={newFieldAllowHalf}
							onCheckedChange={setNewFieldAllowHalf}
						/>
					</div>
				</>
			)}

			{newFieldType === "file" && (
				<>
					<div>
						<Label>{t("fieldProperties.acceptedTypes")}</Label>
						<Input
							value={newFieldAcceptedTypes}
							onChange={(e) => setNewFieldAcceptedTypes(e.target.value)}
							placeholder=".pdf,.doc,.docx"
							className="mt-1"
						/>
					</div>
					<div>
						<Label>{t("fieldProperties.maxFileSize")}</Label>
						<Input
							type="number"
							min={0}
							value={newFieldMaxFileSize === "" ? "" : newFieldMaxFileSize}
							onChange={(e) =>
								setNewFieldMaxFileSize(
									e.target.value === "" ? "" : Number(e.target.value),
								)
							}
							placeholder="10"
							className="mt-1"
						/>
					</div>
				</>
			)}

			{(newFieldType === "date" || newFieldType === "datetime") && (
				<div className="grid grid-cols-2 gap-2">
					<div>
						<Label>{t("fieldProperties.min")}</Label>
						<Input
							type="date"
							value={newFieldDateMin}
							onChange={(e) => setNewFieldDateMin(e.target.value)}
							className="mt-1"
						/>
					</div>
					<div>
						<Label>{t("fieldProperties.max")}</Label>
						<Input
							type="date"
							value={newFieldDateMax}
							onChange={(e) => setNewFieldDateMax(e.target.value)}
							className="mt-1"
						/>
					</div>
				</div>
			)}

			{newFieldType === "time" && (
				<div>
					<Label>{t("fieldProperties.step")}</Label>
					<Input
						type="number"
						min={1}
						value={newFieldTimeStep === "" ? "" : newFieldTimeStep}
						onChange={(e) =>
							setNewFieldTimeStep(
								e.target.value === "" ? "" : Number(e.target.value),
							)
						}
						placeholder="15"
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

			{/* Schema preview in dialog */}
			<div className="mt-4 rounded-lg border bg-muted/30 p-3 space-y-2">
				<p className="text-sm font-medium">{t("formEditor.schemaPreview")}</p>
				<div className="grid grid-cols-2 gap-2 text-xs">
					<div>
						<p className="text-muted-foreground mb-1">
							{t("formEditor.input")}
						</p>
						<pre className="overflow-x-auto rounded bg-background p-2 font-mono">
							{JSON.stringify(
								getFieldSchemaPreview(buildFieldFromForm("preview")).input,
								null,
								2,
							)}
						</pre>
					</div>
					<div>
						<p className="text-muted-foreground mb-1">
							{t("formEditor.output")}
						</p>
						<pre className="overflow-x-auto rounded bg-background p-2 font-mono">
							{JSON.stringify(
								getFieldSchemaPreview(buildFieldFromForm("preview")).output,
								null,
								2,
							)}
						</pre>
					</div>
				</div>
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
							onClick={() => requestLeave(`/${formId}`)}
							className="gap-2 px-2 md:px-3"
						>
							<ArrowLeft className="h-4 w-4" />
							<span className="hidden sm:inline">{t("common.cancel")}</span>
						</Button>
						<Separator orientation="vertical" className="h-6 hidden sm:block" />
						<div className="min-w-0">
							<h1 className="text-lg md:text-2xl font-semibold text-foreground truncate">
								{t("formEditor.editFields")}
							</h1>
							<p className="text-xs md:text-sm text-muted-foreground truncate">
								{getFieldLabel(selectedForm.name, selectedForm.nameEs)}
							</p>
						</div>
					</div>
					<div className="flex gap-2 flex-wrap items-center">
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
							onClick={() => {
								updateEditingFields(fields);
								router.push(`/preview/${selectedForm.id}?from=editor`);
							}}
							className="gap-2 flex-1 sm:flex-none"
							size="sm"
						>
							<Eye className="h-4 w-4" />
							<span className="hidden md:inline">
								{t("formEditor.fullPreview")}
							</span>
						</Button>
						<Button
							variant="outline"
							onClick={handleSaveDraft}
							disabled={isSavingDraft}
							className="gap-2 flex-1 sm:flex-none"
							size="sm"
						>
							<Save className="h-4 w-4" />
							<span className="hidden md:inline">
								{t("formEditor.saveDraft")}
							</span>
						</Button>
						<Button
							onClick={() => setShowPublishDialog(true)}
							className="gap-2 flex-1 sm:flex-none"
							size="sm"
							disabled={fields.length === 0}
							title={
								fields.length === 0
									? t("formEditor.noFieldsToPublish")
									: selectedForm.status === "published"
										? t("formEditor.updateForm")
										: t("formEditor.publishForm")
							}
							variant={
								selectedForm.status === "published" ? "outline" : "default"
							}
						>
							{selectedForm.status === "published" ? (
								<RefreshCw className="h-4 w-4" />
							) : (
								<Rocket className="h-4 w-4" />
							)}
							<span className="hidden md:inline">
								{selectedForm.status === "published"
									? t("formEditor.update")
									: t("formEditor.publish")}
							</span>
						</Button>
						<SessionControls />
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
														<div className="flex items-center gap-2 mb-2 flex-wrap">
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
															{getFieldPropertyBadges(field).map((b) => (
																<Badge
																	key={b}
																	variant="outline"
																	className="text-xs font-mono"
																>
																	{b}
																</Badge>
															))}
														</div>

														<div className="bg-muted/30 rounded-lg p-3 md:p-4 border mb-3">
															<FormFieldRenderer
																field={field}
																value={previewData[field.id]}
																onChange={handlePreviewChange}
																compact
															/>
														</div>

														<Collapsible
															open={expandedFieldId === field.id}
															onOpenChange={(open) =>
																setExpandedFieldId(open ? field.id : null)
															}
														>
															<CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
																{expandedFieldId === field.id ? (
																	<ChevronDown className="h-4 w-4" />
																) : (
																	<ChevronRight className="h-4 w-4" />
																)}
																<Code className="h-4 w-4" />
																{t("formEditor.schemaPreview")}
															</CollapsibleTrigger>
															<CollapsibleContent className="mt-3 space-y-3">
																<div className="rounded-lg border bg-muted/50 p-3 text-xs">
																	<p className="font-medium mb-2">
																		{t("formEditor.input")}
																	</p>
																	<pre className="overflow-x-auto font-mono">
																		{JSON.stringify(
																			getFieldSchemaPreview(field).input,
																			null,
																			2,
																		)}
																	</pre>
																</div>
																<div className="rounded-lg border bg-muted/50 p-3 text-xs">
																	<p className="font-medium mb-2">
																		{t("formEditor.output")}
																	</p>
																	<pre className="overflow-x-auto font-mono">
																		{JSON.stringify(
																			getFieldSchemaPreview(field).output,
																			null,
																			2,
																		)}
																	</pre>
																</div>
															</CollapsibleContent>
														</Collapsible>
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
						<Button
							onClick={handleAddField}
							disabled={
								!newFieldLabel.trim() || isFieldLabelDuplicate(newFieldLabel)
							}
						>
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
							disabled={
								!newFieldLabel.trim() ||
								isFieldLabelDuplicate(newFieldLabel, editingField?.id)
							}
						>
							{t("common.save")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Publish Confirm Dialog */}
			<Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("formEditor.publishForm")}</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<p className="text-sm text-muted-foreground">
							{t("formEditor.publishConfirm")}
						</p>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowPublishDialog(false)}
						>
							{t("common.cancel")}
						</Button>
						<Button onClick={handlePublish} disabled={isPublishing}>
							{isPublishing ? t("common.loading") : t("formEditor.publish")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Unsaved Changes Confirmation Dialog */}
			<Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("formEditor.leaveTitle")}</DialogTitle>
						<DialogDescription>
							{t("formEditor.leaveMessage")}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowLeaveDialog(false);
								pendingNavigationRef.current = null;
							}}
							disabled={isSavingAndLeaving}
						>
							{t("formEditor.leaveCancel")}
						</Button>
						<Button onClick={handleSaveAndLeave} disabled={isSavingAndLeaving}>
							{isSavingAndLeaving
								? t("common.loading")
								: t("formEditor.saveAndLeave")}
						</Button>
						<Button
							variant="destructive"
							onClick={confirmLeave}
							disabled={isSavingAndLeaving}
						>
							{t("formEditor.leaveConfirm")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
