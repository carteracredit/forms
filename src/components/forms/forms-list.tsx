"use client";

import { useState } from "react";
import { useFormStore } from "@/lib/form-store";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
	Search,
	FileText,
	Clock,
	Tag,
	MoreVertical,
	Eye,
	Edit,
	Trash2,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";

interface FormsListProps {
	onViewForm: (formId: string) => void;
	onEditForm: (formId: string) => void;
}

export function FormsList({ onViewForm, onEditForm }: FormsListProps) {
	const { forms, deleteForm } = useFormStore();
	const { t, language } = useLanguage();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"all" | "draft" | "published" | "archived"
	>("all");

	const filteredForms = forms.filter((form) => {
		const matchesSearch =
			form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			form.description.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus =
			statusFilter === "all" || form.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

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

	const getStatusLabel = (status: string) => {
		return t(`status.${status}`);
	};

	const dateLocale = language === "es" ? es : enUS;

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="border-b bg-background px-6 py-4">
				{/* Search and Filters */}
				<div className="flex gap-3">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder={t("formsList.searchPlaceholder")}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>
					<div className="flex gap-2">
						{(["all", "published", "draft", "archived"] as const).map(
							(status) => (
								<Button
									key={status}
									variant={statusFilter === status ? "default" : "outline"}
									size="sm"
									onClick={() => setStatusFilter(status)}
								>
									{getStatusLabel(status)}
								</Button>
							),
						)}
					</div>
				</div>
			</div>

			{/* Forms Grid */}
			<div className="flex-1 overflow-auto p-6">
				{filteredForms.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-center">
						<FileText className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium text-foreground mb-2">
							{t("formsList.noFormsFound")}
						</h3>
						<p className="text-sm text-muted-foreground mb-4">
							{searchQuery
								? t("formsList.tryAdjusting")
								: t("formsList.noFormsFoundDesc")}
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{filteredForms.map((form) => (
							<Card
								key={form.id}
								className="p-5 hover:shadow-md transition-shadow cursor-pointer group"
								onClick={() => onViewForm(form.id)}
							>
								<div className="flex items-start justify-between mb-3">
									<div className="flex items-center gap-2">
										<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
											<FileText className="h-5 w-5 text-primary" />
										</div>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger
											asChild
											onClick={(e) => e.stopPropagation()}
										>
											<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												onClick={(e) => {
													e.stopPropagation();
													onViewForm(form.id);
												}}
											>
												<Eye className="h-4 w-4 mr-2" />
												{t("formsList.viewDetails")}
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={(e) => {
													e.stopPropagation();
													onEditForm(form.id);
												}}
											>
												<Edit className="h-4 w-4 mr-2" />
												{t("formsList.editForm")}
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={(e) => {
													e.stopPropagation();
													if (confirm(t("formsList.deleteConfirm"))) {
														deleteForm(form.id);
													}
												}}
												className="text-destructive"
											>
												<Trash2 className="h-4 w-4 mr-2" />
												{t("common.delete")}
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>

								<h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
									{form.name}
								</h3>
								<p className="text-sm text-muted-foreground line-clamp-2 mb-3">
									{form.description}
								</p>

								<div className="flex items-center gap-2 mb-3">
									<Badge
										variant="outline"
										className={getStatusColor(form.status)}
									>
										{getStatusLabel(form.status)}
									</Badge>
									<Badge variant="outline" className="text-xs">
										v{form.currentVersion}
									</Badge>
								</div>

								{form.tags.length > 0 && (
									<div className="flex items-center gap-1.5 mb-3 flex-wrap">
										<Tag className="h-3 w-3 text-muted-foreground" />
										{form.tags.slice(0, 3).map((tag) => (
											<span key={tag} className="text-xs text-muted-foreground">
												{tag}
											</span>
										))}
										{form.tags.length > 3 && (
											<span className="text-xs text-muted-foreground">
												+{form.tags.length - 3}
											</span>
										)}
									</div>
								)}

								<div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-3 border-t">
									<Clock className="h-3 w-3" />
									{t("formsList.updated")}{" "}
									{formatDistanceToNow(new Date(form.updatedAt), {
										addSuffix: true,
										locale: dateLocale,
									})}
								</div>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
