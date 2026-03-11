"use client";

import { useFormStore } from "@/lib/form-store";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	ArrowLeft,
	Edit,
	Calendar,
	User,
	History,
	Code,
	FileJson,
	ChevronDown,
	Eye,
	Info,
	Plus,
	Upload,
	Archive,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useState } from "react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FieldShowcase } from "./field-showcase";
import { SessionControls } from "@/components/SessionControls";
import { EditFormInfoDialog } from "./edit-form-info-dialog";
import { toast } from "sonner";

interface FormDetailProps {
	onBack: () => void;
	onEdit: () => void;
	/** Initial tab to show. Defaults to "details". */
	initialTab?: "details" | "fieldLibrary";
}

export function FormDetail({
	onBack,
	onEdit,
	initialTab = "details",
}: FormDetailProps) {
	const {
		selectedForm,
		selectedVersion,
		setSelectedVersion,
		publishForm,
		archiveForm,
	} = useFormStore();
	const { t, language, getFieldLabel } = useLanguage();
	const router = useRouter();
	const [showVersions, setShowVersions] = useState(false);
	const [showInputSchema, setShowInputSchema] = useState(false);
	const [showOutputSchema, setShowOutputSchema] = useState(true);
	const [showEditInfoDialog, setShowEditInfoDialog] = useState(false);
	const [showPublishDialog, setShowPublishDialog] = useState(false);
	const [showArchiveDialog, setShowArchiveDialog] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);
	const [isArchiving, setIsArchiving] = useState(false);

	const dateLocale = language === "es" ? es : enUS;

	if (!selectedForm) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-muted-foreground">
					{t("formEditor.noFormSelected")}
				</p>
			</div>
		);
	}

	const handlePublish = async () => {
		setIsPublishing(true);
		try {
			await publishForm(selectedForm.id);
			toast.success(t("formDetail.publishSuccess"));
			setShowPublishDialog(false);
		} catch {
			toast.error(t("formDetail.publishError"));
		} finally {
			setIsPublishing(false);
		}
	};

	const handleArchive = async () => {
		setIsArchiving(true);
		try {
			await archiveForm(selectedForm.id);
			toast.success(t("formDetail.archiveSuccess"));
			setShowArchiveDialog(false);
		} catch {
			toast.error(t("formDetail.archiveError"));
		} finally {
			setIsArchiving(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "published":
				return "bg-emerald-100 text-emerald-700 border-emerald-200";
			case "draft":
				return "bg-amber-100 text-amber-700 border-amber-200";
			case "archived":
				return "bg-slate-100 text-slate-700 border-slate-200";
			default:
				return "bg-slate-100 text-slate-700 border-slate-200";
		}
	};

	const getFieldTypeLabel = (type: string) => {
		return t(`fieldTypes.${type}`);
	};

	// Working draft fields (what the user is editing)
	const displayFields = selectedForm.draftFields;

	// Latest published version for schema display
	const latestPublishedVersion =
		selectedForm.versions.length > 0
			? selectedForm.versions.reduce((a, b) => (a.version > b.version ? a : b))
			: null;

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="border-b bg-background px-6 py-4">
				<div className="flex items-center gap-4 mb-4">
					<Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
						<ArrowLeft className="h-4 w-4" />
						{t("common.back")}
					</Button>
					<Separator orientation="vertical" className="h-6" />
					<div className="flex-1 min-w-0">
						<h1 className="text-2xl font-semibold text-foreground truncate">
							{selectedForm.name}
						</h1>
						<p className="text-sm text-muted-foreground mt-1 truncate">
							{selectedForm.description}
						</p>
					</div>
					<div className="flex items-center gap-2 shrink-0">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowEditInfoDialog(true)}
							className="gap-2"
						>
							<Info className="h-4 w-4" />
							{t("formDetail.editInfo")}
						</Button>
						<Button
							variant="outline"
							onClick={() => router.push(`/preview/${selectedForm.id}`)}
							className="gap-2"
						>
							<Eye className="h-4 w-4" />
							{t("formDetail.previewForm")}
						</Button>
						{selectedForm.status === "draft" && (
							<>
								<Button onClick={onEdit} variant="outline" className="gap-2">
									<Edit className="h-4 w-4" />
									{t("formDetail.editFields")}
								</Button>
								<Button
									onClick={() => setShowPublishDialog(true)}
									className="gap-2"
								>
									<Upload className="h-4 w-4" />
									{t("formDetail.publish")}
								</Button>
							</>
						)}
						{selectedForm.status === "published" && (
							<>
								<Button onClick={onEdit} variant="outline" className="gap-2">
									<Edit className="h-4 w-4" />
									{t("formDetail.editFields")}
								</Button>
								<Button
									variant="destructive"
									onClick={() => setShowArchiveDialog(true)}
									className="gap-2"
								>
									<Archive className="h-4 w-4" />
									{t("formDetail.archive")}
								</Button>
							</>
						)}
						<SessionControls />
					</div>
				</div>

				<div className="flex items-center gap-3">
					<Badge
						variant="outline"
						className={getStatusColor(selectedForm.status)}
					>
						{t(`status.${selectedForm.status}`)}
					</Badge>
					{selectedForm.currentVersion > 0 && (
						<Badge variant="outline">
							{t("common.version")} {selectedForm.currentVersion}
						</Badge>
					)}
					{selectedForm.tags.length > 0 && (
						<span className="text-sm text-muted-foreground">
							{selectedForm.tags.join(", ")}
						</span>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-auto p-6">
				<div className="max-w-5xl mx-auto">
					<Tabs defaultValue={initialTab} className="space-y-6">
						<TabsList>
							<TabsTrigger value="details">
								{t("formDetail.formDetails")}
							</TabsTrigger>
							<TabsTrigger value="fieldLibrary">
								{t("formDetail.fieldLibrary")}
							</TabsTrigger>
						</TabsList>

						<TabsContent value="details" className="space-y-6">
							{/* Draft Fields */}
							<Card className="p-6">
								<h2 className="text-lg font-semibold mb-4">
									{t("formDetail.draftFields")}
								</h2>
								{displayFields.length === 0 ? (
									<div className="text-center py-12 border-2 border-dashed rounded-lg">
										<p className="text-sm text-muted-foreground mb-4">
											{t("formDetail.noDraftFields")}
										</p>
										{selectedForm.status !== "archived" && (
											<Button
												onClick={onEdit}
												variant="outline"
												className="gap-2"
											>
												<Plus className="h-4 w-4" />
												{t("formDetail.goToEditor")}
											</Button>
										)}
									</div>
								) : (
									<div className="space-y-3">
										{displayFields.map((field, index) => (
											<div
												key={field.id}
												className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
											>
												<div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 text-primary font-medium text-sm flex-shrink-0">
													{index + 1}
												</div>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-1">
														<h4 className="font-medium text-foreground">
															{getFieldLabel(field.label, field.labelEs)}
														</h4>
														{field.required && (
															<Badge variant="outline" className="text-xs">
																{t("common.required")}
															</Badge>
														)}
													</div>
													<p className="text-sm text-muted-foreground mb-2">
														{getFieldTypeLabel(field.type)}
													</p>
													{field.placeholder && (
														<p className="text-xs text-muted-foreground italic">
															{t("common.placeholder")}: {field.placeholder}
														</p>
													)}
													{field.options && field.options.length > 0 && (
														<div className="mt-2 flex flex-wrap gap-1.5">
															{field.options.map((option) => (
																<Badge
																	key={option}
																	className="text-xs bg-teal-500/20 text-teal-700 dark:text-teal-300 hover:bg-teal-500/30 border-teal-500/30"
																>
																	{option}
																</Badge>
															))}
														</div>
													)}
												</div>
											</div>
										))}
									</div>
								)}
							</Card>

							{/* Schema Management (only when there's a published version) */}
							{latestPublishedVersion && (
								<Card className="p-6">
									<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
										<FileJson className="h-5 w-5" />
										{t("formDetail.schemaManagement")}
									</h2>

									<div className="space-y-4">
										{/* Input Schema */}
										<Collapsible
											open={showInputSchema}
											onOpenChange={setShowInputSchema}
										>
											<CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
												<div className="flex items-center gap-2">
													<Code className="h-4 w-4 text-blue-600" />
													<span className="font-medium">
														{t("formDetail.inputSchema")}
													</span>
													<Badge className="text-xs bg-teal-500/20 text-teal-700 dark:text-teal-300 hover:bg-teal-500/30 border-teal-500/30">
														{t("formDetail.preFillData")}
													</Badge>
												</div>
												<ChevronDown
													className={`h-4 w-4 transition-transform ${showInputSchema ? "rotate-180" : ""}`}
												/>
											</CollapsibleTrigger>
											<CollapsibleContent className="mt-2">
												<div className="p-4 rounded-lg bg-muted/50 border">
													<p className="text-xs text-muted-foreground mb-2">
														{t("formDetail.inputSchemaDesc")}
													</p>
													<pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
														<code>
															{JSON.stringify(
																latestPublishedVersion.schema.input,
																null,
																2,
															)}
														</code>
													</pre>
												</div>
											</CollapsibleContent>
										</Collapsible>

										{/* Output Schema */}
										<Collapsible
											open={showOutputSchema}
											onOpenChange={setShowOutputSchema}
										>
											<CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
												<div className="flex items-center gap-2">
													<Code className="h-4 w-4 text-emerald-600" />
													<span className="font-medium">
														{t("formDetail.outputSchema")}
													</span>
													<Badge className="text-xs bg-teal-500/20 text-teal-700 dark:text-teal-300 hover:bg-teal-500/30 border-teal-500/30">
														{t("formDetail.responseData")}
													</Badge>
												</div>
												<ChevronDown
													className={`h-4 w-4 transition-transform ${showOutputSchema ? "rotate-180" : ""}`}
												/>
											</CollapsibleTrigger>
											<CollapsibleContent className="mt-2">
												<div className="p-4 rounded-lg bg-muted/50 border">
													<p className="text-xs text-muted-foreground mb-2">
														{t("formDetail.outputSchemaDesc")}
													</p>
													<pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
														<code>
															{JSON.stringify(
																latestPublishedVersion.schema.output,
																null,
																2,
															)}
														</code>
													</pre>
												</div>
											</CollapsibleContent>
										</Collapsible>
									</div>
								</Card>
							)}

							{/* Published Version History */}
							<Card className="p-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-lg font-semibold flex items-center gap-2">
										<History className="h-5 w-5" />
										{t("formDetail.versionHistory")}
									</h2>
									{selectedForm.versions.length > 1 && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => setShowVersions(!showVersions)}
										>
											{showVersions
												? t("formDetail.hideVersions")
												: t("formDetail.showAllVersions")}
										</Button>
									)}
								</div>

								{selectedForm.versions.length === 0 ? (
									<p className="text-sm text-muted-foreground py-4 text-center">
										{t("formDetail.noVersionsYet")}
									</p>
								) : (
									<div className="space-y-3">
										{(showVersions
											? selectedForm.versions
											: [
													selectedForm.versions.reduce((a, b) =>
														a.version > b.version ? a : b,
													),
												]
										)
											.sort((a, b) => b.version - a.version)
											.map((version) => (
												<div
													key={version.id}
													className={`p-4 rounded-lg border ${
														selectedVersion?.id === version.id
															? "bg-primary/5 border-primary"
															: "bg-card hover:bg-accent/50"
													} transition-colors cursor-pointer`}
													onClick={() => setSelectedVersion(version.id)}
												>
													<div className="flex items-start justify-between mb-2">
														<div className="flex items-center gap-2">
															<Badge
																variant={
																	version.version ===
																	selectedForm.currentVersion
																		? "default"
																		: "outline"
																}
																className="font-mono"
															>
																v{version.version}
															</Badge>
															{version.version ===
																selectedForm.currentVersion && (
																<Badge
																	variant="outline"
																	className="bg-emerald-100 text-emerald-700 border-emerald-200"
																>
																	{t("common.current")}
																</Badge>
															)}
														</div>
														<div className="text-xs text-muted-foreground flex items-center gap-1.5">
															<Calendar className="h-3 w-3" />
															{format(
																new Date(version.createdAt),
																"MMM d, yyyy",
																{
																	locale: dateLocale,
																},
															)}
														</div>
													</div>
													<p className="text-sm text-foreground mb-2">
														{version.changelog}
													</p>
													<div className="flex items-center gap-4 text-xs text-muted-foreground">
														<div className="flex items-center gap-1.5">
															<User className="h-3 w-3" />
															{version.createdBy}
														</div>
														<div>
															{version.fields.length}{" "}
															{version.fields.length !== 1
																? t("formDetail.fields")
																: t("formDetail.field")}
														</div>
														<div>
															{formatDistanceToNow(
																new Date(version.createdAt),
																{
																	addSuffix: true,
																	locale: dateLocale,
																},
															)}
														</div>
													</div>
												</div>
											))}
									</div>
								)}
							</Card>

							{/* Metadata */}
							<Card className="p-6">
								<h2 className="text-lg font-semibold mb-4">
									{t("formDetail.metadata")}
								</h2>
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<p className="text-muted-foreground mb-1">
											{t("formDetail.created")}
										</p>
										<p className="font-medium">
											{format(new Date(selectedForm.createdAt), "PPpp", {
												locale: dateLocale,
											})}
										</p>
									</div>
									<div>
										<p className="text-muted-foreground mb-1">
											{t("formDetail.lastUpdated")}
										</p>
										<p className="font-medium">
											{format(new Date(selectedForm.updatedAt), "PPpp", {
												locale: dateLocale,
											})}
										</p>
									</div>
									<div>
										<p className="text-muted-foreground mb-1">
											{t("formDetail.formId")}
										</p>
										<p className="font-mono text-xs">{selectedForm.id}</p>
									</div>
									<div>
										<p className="text-muted-foreground mb-1">
											{t("formDetail.totalVersions")}
										</p>
										<p className="font-medium">
											{selectedForm.versions.length}
										</p>
									</div>
								</div>
							</Card>
						</TabsContent>

						<TabsContent value="fieldLibrary" className="space-y-6">
							<FieldShowcase />
						</TabsContent>
					</Tabs>
				</div>
			</div>

			{/* Edit Form Info Dialog */}
			<EditFormInfoDialog
				open={showEditInfoDialog}
				onOpenChange={setShowEditInfoDialog}
			/>

			{/* Publish Confirm Dialog */}
			<Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("formDetail.publishForm")}</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<p className="text-sm text-muted-foreground">
							{t("formDetail.publishConfirm")}
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
							{isPublishing ? t("common.loading") : t("formDetail.publish")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Archive Confirm Dialog */}
			<Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("formDetail.archiveForm")}</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<p className="text-sm text-muted-foreground">
							{t("formDetail.archiveConfirm")}
						</p>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowArchiveDialog(false)}
						>
							{t("common.cancel")}
						</Button>
						<Button
							variant="destructive"
							onClick={handleArchive}
							disabled={isArchiving}
						>
							{isArchiving ? t("common.loading") : t("formDetail.archive")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
