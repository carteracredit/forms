"use client";

import { useState, useRef } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Download, Upload, FileUp, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import type { FormExport } from "@/lib/forms/form-export-schema";

interface JSONModalProps {
	open: boolean;
	onClose: () => void;
	mode: "export" | "import";
	exportData?: FormExport;
	allowReplace?: boolean;
	onImportNew: (data: FormExport) => void | Promise<void>;
	onImportReplace?: (data: FormExport) => void | Promise<void>;
}

export function JSONModal({
	open,
	onClose,
	mode,
	exportData,
	allowReplace = false,
	onImportNew,
	onImportReplace,
}: JSONModalProps) {
	const [jsonText, setJsonText] = useState(
		mode === "export" && exportData ? JSON.stringify(exportData, null, 2) : "",
	);
	const [error, setError] = useState<string | null>(null);
	const [importMode, setImportMode] = useState<"new" | "replace">("new");
	const [loading, setLoading] = useState(false);
	const { t } = useLanguage();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleImport = async () => {
		const { parseFormImport } = await import("@/lib/forms/io");

		try {
			const parsed = parseFormImport(jsonText);
			setError(null);
			setLoading(true);

			try {
				if (importMode === "replace" && onImportReplace) {
					await onImportReplace(parsed);
				} else {
					await onImportNew(parsed);
				}
			} finally {
				setLoading(false);
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : t("jsonModal.errorParseJson"),
			);
		}
	};

	const handleDownload = async () => {
		if (!exportData) return;
		const { downloadFormJson } = await import("@/lib/forms/io");
		downloadFormJson(exportData);
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			const text = ev.target?.result;
			if (typeof text === "string") {
				setJsonText(text);
				setError(null);
			}
		};
		reader.readAsText(file);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 w-[90vw]">
				<DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
					<DialogTitle>
						{mode === "export" ? (
							<span className="flex items-center gap-2">
								<Download className="h-5 w-5" />
								{t("jsonModal.exportTitle")}
							</span>
						) : (
							<span className="flex items-center gap-2">
								<Upload className="h-5 w-5" />
								{t("jsonModal.importTitle")}
							</span>
						)}
					</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col flex-1 min-h-0 px-6 py-4 gap-4">
					{mode === "import" && allowReplace && (
						<div className="flex-shrink-0">
							<RadioGroup
								value={importMode}
								onValueChange={(v) => setImportMode(v as "new" | "replace")}
								className="flex gap-4"
							>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="new" id="mode-new" />
									<Label htmlFor="mode-new">{t("jsonModal.modeNew")}</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="replace" id="mode-replace" />
									<Label htmlFor="mode-replace">
										{t("jsonModal.modeReplace")}
									</Label>
								</div>
							</RadioGroup>
							{importMode === "replace" && (
								<p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
									<AlertTriangle className="h-3 w-3" />
									{t("jsonModal.modeReplaceWarning")}
								</p>
							)}
						</div>
					)}

					<div className="flex-1 min-h-0 flex flex-col">
						<div className="flex-1 min-h-0 overflow-auto rounded-md border border-border">
							<Textarea
								value={jsonText}
								onChange={(e) => setJsonText(e.target.value)}
								className="font-mono text-xs h-full min-h-[200px] resize-none border-0 focus-visible:ring-0"
								readOnly={mode === "export"}
								placeholder={
									mode === "import" ? t("jsonModal.importPlaceholder") : ""
								}
							/>
						</div>
					</div>

					{error && (
						<div className="rounded bg-destructive/10 p-3 text-sm text-destructive flex-shrink-0">
							{error}
						</div>
					)}

					<div className="flex justify-end gap-2 flex-shrink-0">
						{mode === "import" && (
							<>
								<input
									ref={fileInputRef}
									type="file"
									accept=".json"
									className="hidden"
									onChange={handleFileUpload}
								/>
								<Button
									variant="outline"
									onClick={() => fileInputRef.current?.click()}
								>
									<FileUp className="mr-2 h-4 w-4" />
									{t("jsonModal.uploadFile")}
								</Button>
							</>
						)}
						<Button variant="outline" onClick={onClose}>
							{t("jsonModal.cancel")}
						</Button>
						{mode === "export" ? (
							<Button onClick={handleDownload}>
								<Download className="mr-2 h-4 w-4" />
								{t("jsonModal.download")}
							</Button>
						) : (
							<Button onClick={handleImport} disabled={loading || !jsonText}>
								<Upload className="mr-2 h-4 w-4" />
								{t("jsonModal.import")}
							</Button>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
