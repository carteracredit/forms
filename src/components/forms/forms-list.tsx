"use client";

import { useState } from "react";
import { useFormStore } from "@/lib/form-store";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Search,
	FileText,
	Clock,
	Tag,
	MoreVertical,
	Eye,
	Edit,
	Trash2,
	Layers,
	CheckCircle2,
	FileEdit,
	Archive,
	Plus,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { Form } from "@/lib/types/form";

interface FormsListProps {
	onViewForm: (formId: string) => void;
	onEditForm: (formId: string) => void;
	onCreateForm: () => void;
}

type StatusFilter = "all" | "draft" | "published" | "archived";

function StatusBadge({ status }: { status: Form["status"] }) {
	const { t } = useLanguage();
	const styles: Record<Form["status"], string> = {
		published:
			"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
		draft:
			"bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
		archived:
			"bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30",
	};
	return (
		<Badge variant="outline" className={styles[status]}>
			{t(`status.${status}`)}
		</Badge>
	);
}

function FormCardRow({
	form,
	onView,
	onEdit,
	onDelete,
	t,
	language,
}: {
	form: Form;
	onView: (id: string) => void;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
	t: (key: string) => string;
	language: string;
}) {
	const dateLocale = language === "es" ? es : enUS;
	return (
		<div
			className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-accent/50 transition-colors"
			onClick={() => onView(form.id)}
		>
			<div className="min-w-0 flex-1">
				<p className="font-medium text-sm truncate">{form.name}</p>
				{form.tags.length > 0 && (
					<div className="flex items-center gap-1 mt-0.5">
						<Tag className="h-3 w-3 text-muted-foreground shrink-0" />
						<span className="text-xs text-muted-foreground truncate">
							{form.tags.slice(0, 2).join(", ")}
							{form.tags.length > 2 && ` +${form.tags.length - 2}`}
						</span>
					</div>
				)}
			</div>
			<div className="flex items-center gap-2 ml-2 shrink-0">
				<StatusBadge status={form.status} />
				<span className="text-xs text-muted-foreground font-mono hidden xs:inline">
					v{form.currentVersion}
				</span>
				<DropdownMenu>
					<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
						<Button variant="ghost" size="icon" className="h-8 w-8">
							<MoreVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={(e) => {
								e.stopPropagation();
								onView(form.id);
							}}
						>
							<Eye className="h-4 w-4 mr-2" />
							{t("formsList.viewDetails")}
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={(e) => {
								e.stopPropagation();
								onEdit(form.id);
							}}
						>
							<Edit className="h-4 w-4 mr-2" />
							{t("formsList.editForm")}
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={(e) => {
								e.stopPropagation();
								onDelete(form.id);
							}}
							className="text-destructive focus:text-destructive"
						>
							<Trash2 className="h-4 w-4 mr-2" />
							{t("common.delete")}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}

function FormsListSkeleton() {
	return (
		<Card className="min-h-[200px] overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow>
						{[1, 2, 3, 4, 5].map((i) => (
							<TableHead key={i}>
								<div className="h-4 bg-muted rounded animate-pulse w-20" />
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 5 }).map((_, i) => (
						<TableRow key={i}>
							<TableCell>
								<div className="h-4 bg-muted rounded animate-pulse w-32" />
							</TableCell>
							<TableCell className="hidden sm:table-cell">
								<div className="h-4 bg-muted rounded animate-pulse w-48" />
							</TableCell>
							<TableCell>
								<div className="h-5 bg-muted rounded animate-pulse w-20" />
							</TableCell>
							<TableCell className="hidden md:table-cell">
								<div className="h-4 bg-muted rounded animate-pulse w-8" />
							</TableCell>
							<TableCell className="hidden lg:table-cell">
								<div className="h-4 bg-muted rounded animate-pulse w-24" />
							</TableCell>
							<TableCell />
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Card>
	);
}

export function FormsList({
	onViewForm,
	onEditForm,
	onCreateForm,
}: FormsListProps) {
	const { forms, deleteForm, isLoading } = useFormStore();
	const { t, language } = useLanguage();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

	const dateLocale = language === "es" ? es : enUS;

	const filteredForms = forms.filter((form) => {
		const matchesSearch =
			form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			form.description.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus =
			statusFilter === "all" || form.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	const stats = {
		total: forms.length,
		published: forms.filter((f) => f.status === "published").length,
		draft: forms.filter((f) => f.status === "draft").length,
		archived: forms.filter((f) => f.status === "archived").length,
	};

	const handleDelete = (formId: string) => {
		if (confirm(t("formsList.deleteConfirm"))) {
			deleteForm(formId);
		}
	};

	const isFiltered = !!searchQuery || statusFilter !== "all";

	if (isLoading && forms.length === 0) {
		return <FormsListSkeleton />;
	}

	return (
		<>
			{/* Stats chips */}
			<div className="mb-5 flex min-h-[44px] flex-wrap justify-center gap-2 overflow-x-auto pb-1">
				{[
					{
						label: t("formsList.statsTotal"),
						value: stats.total,
						tab: "all" as StatusFilter,
						icon: <Layers className="h-3.5 w-3.5" />,
						iconBg: "bg-primary/10",
						iconColor: "text-primary",
						numColor: "text-foreground",
						activeBorder: "border-primary",
						activeBg: "bg-primary/10",
						activeLabel: "text-primary",
					},
					{
						label: t("formsList.statsPublished"),
						value: stats.published,
						tab: "published" as StatusFilter,
						icon: <CheckCircle2 className="h-3.5 w-3.5" />,
						iconBg: "bg-emerald-500/10",
						iconColor: "text-emerald-500",
						numColor: "text-emerald-600 dark:text-emerald-400",
						activeBorder: "border-emerald-500",
						activeBg: "bg-emerald-500/10",
						activeLabel: "text-emerald-600 dark:text-emerald-400",
					},
					{
						label: t("formsList.statsDraft"),
						value: stats.draft,
						tab: "draft" as StatusFilter,
						icon: <FileEdit className="h-3.5 w-3.5" />,
						iconBg: "bg-amber-500/10",
						iconColor: "text-amber-500",
						numColor: "text-amber-600 dark:text-amber-400",
						activeBorder: "border-amber-500",
						activeBg: "bg-amber-500/10",
						activeLabel: "text-amber-600 dark:text-amber-400",
					},
					{
						label: t("formsList.statsArchived"),
						value: stats.archived,
						tab: "archived" as StatusFilter,
						icon: <Archive className="h-3.5 w-3.5" />,
						iconBg: "bg-muted",
						iconColor: "text-muted-foreground",
						numColor: "text-muted-foreground",
						activeBorder: "border-slate-400 dark:border-slate-500",
						activeBg: "bg-slate-500/10",
						activeLabel: "text-slate-600 dark:text-slate-400",
					},
				].map((stat) => {
					const isActive = statusFilter === stat.tab;
					return (
						<button
							key={stat.label}
							onClick={() => setStatusFilter(stat.tab)}
							className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-all hover:bg-accent ${
								isActive
									? `${stat.activeBorder} ${stat.activeBg} shadow-sm`
									: "border-border bg-card"
							}`}
						>
							<span
								className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md ${stat.iconBg} ${stat.iconColor}`}
							>
								{stat.icon}
							</span>
							<span className={`font-bold tabular-nums ${stat.numColor}`}>
								{stat.value}
							</span>
							<span
								className={`transition-colors ${isActive ? stat.activeLabel : "text-muted-foreground"}`}
							>
								{stat.label}
							</span>
						</button>
					);
				})}
			</div>

			{/* Search bar + result count */}
			<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
				<div className="relative w-full min-w-0 flex-1 sm:max-w-sm">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder={t("formsList.searchPlaceholder")}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
				<span className="shrink-0 text-sm text-muted-foreground tabular-nums">
					{filteredForms.length === 1
						? `1 ${t("formsList.result")}`
						: `${filteredForms.length} ${t("formsList.results")}`}
				</span>
			</div>

			{/* Table card */}
			<Card className="min-h-[200px] overflow-hidden">
				{filteredForms.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
						<FileText className="h-10 w-10 opacity-30" />
						<p className="text-sm">
							{isFiltered
								? t("formsList.noFormsFound")
								: t("formsList.noFormsYet")}
						</p>
						{!isFiltered && (
							<Button variant="outline" size="sm" onClick={onCreateForm}>
								<Plus className="mr-2 h-4 w-4" />
								{t("formsList.createForm")}
							</Button>
						)}
					</div>
				) : (
					<>
						{/* Mobile card list */}
						<div className="md:hidden divide-y">
							{filteredForms.map((form) => (
								<FormCardRow
									key={form.id}
									form={form}
									onView={onViewForm}
									onEdit={onEditForm}
									onDelete={handleDelete}
									t={t}
									language={language}
								/>
							))}
						</div>

						{/* Desktop table */}
						<div className="hidden md:block">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t("formsList.colName")}</TableHead>
										<TableHead className="hidden sm:table-cell">
											{t("formsList.colDescription")}
										</TableHead>
										<TableHead>{t("formsList.colStatus")}</TableHead>
										<TableHead className="hidden md:table-cell">
											{t("formsList.colVersion")}
										</TableHead>
										<TableHead className="hidden lg:table-cell">
											{t("formsList.colUpdated")}
										</TableHead>
										<TableHead className="w-[60px]" />
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredForms.map((form) => (
										<TableRow
											key={form.id}
											className="cursor-pointer"
											onClick={() => onViewForm(form.id)}
										>
											<TableCell className="font-medium">
												{form.name}
												{form.tags.length > 0 && (
													<div className="flex items-center gap-1 mt-0.5">
														<Tag className="h-3 w-3 text-muted-foreground shrink-0" />
														<span className="text-xs text-muted-foreground">
															{form.tags.slice(0, 2).join(", ")}
															{form.tags.length > 2 &&
																` +${form.tags.length - 2}`}
														</span>
													</div>
												)}
											</TableCell>
											<TableCell className="hidden max-w-xs truncate text-muted-foreground sm:table-cell">
												{form.description || (
													<span className="italic opacity-50">
														{t("formsList.noDescription")}
													</span>
												)}
											</TableCell>
											<TableCell>
												<StatusBadge status={form.status} />
											</TableCell>
											<TableCell className="hidden md:table-cell">
												<span className="font-mono text-xs text-muted-foreground">
													v{form.currentVersion}
												</span>
											</TableCell>
											<TableCell className="hidden text-muted-foreground lg:table-cell">
												{formatDistanceToNow(new Date(form.updatedAt), {
													addSuffix: true,
													locale: dateLocale,
												})}
											</TableCell>
											<TableCell
												onClick={(e) => e.stopPropagation()}
												className="text-right"
											>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8"
														>
															<MoreVertical className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={() => onViewForm(form.id)}
														>
															<Eye className="mr-2 h-4 w-4" />
															{t("formsList.viewDetails")}
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => onEditForm(form.id)}
														>
															<Edit className="mr-2 h-4 w-4" />
															{t("formsList.editForm")}
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => handleDelete(form.id)}
															className="text-destructive focus:text-destructive"
														>
															<Trash2 className="mr-2 h-4 w-4" />
															{t("common.delete")}
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</>
				)}
			</Card>
		</>
	);
}
