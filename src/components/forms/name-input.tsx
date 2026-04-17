"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/LanguageProvider";

export interface NameValue {
	firstName: string;
	middleName?: string;
	lastName: string;
}

interface NameInputProps {
	value?: string | NameValue;
	onChange: (value: NameValue) => void;
	includeMiddleName?: boolean;
	disabled?: boolean;
	largeText?: boolean;
}

function parseInitialValue(value?: string | NameValue): NameValue {
	if (!value) return { firstName: "", middleName: "", lastName: "" };
	if (typeof value === "string") {
		const parts = value.trim().split(/\s+/);
		if (parts.length === 1)
			return { firstName: parts[0], middleName: "", lastName: "" };
		if (parts.length === 2)
			return { firstName: parts[0], middleName: "", lastName: parts[1] };
		return {
			firstName: parts[0],
			middleName: parts.slice(1, -1).join(" "),
			lastName: parts[parts.length - 1],
		};
	}
	return value;
}

export function computeFullName(name: NameValue): string {
	return [name.firstName, name.middleName, name.lastName]
		.filter(Boolean)
		.join(" ");
}

export function NameInput({
	value,
	onChange,
	includeMiddleName = false,
	disabled = false,
	largeText = false,
}: NameInputProps) {
	const { t } = useLanguage();
	const [name, setName] = useState<NameValue>(() => parseInitialValue(value));

	useEffect(() => {
		setName(parseInitialValue(value));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const inputClass = largeText ? "text-base py-3" : "";
	const labelClass = largeText ? "text-base" : "text-sm";

	const handleFieldChange = (field: keyof NameValue, fieldValue: string) => {
		const updated = { ...name, [field]: fieldValue };
		setName(updated);
		onChange(updated);
	};

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="space-y-1.5">
					<Label className={labelClass}>{t("name.firstName")}</Label>
					<Input
						value={name.firstName}
						onChange={(e) => handleFieldChange("firstName", e.target.value)}
						placeholder={t("name.firstNamePlaceholder")}
						disabled={disabled}
						className={inputClass}
					/>
				</div>
				<div className="space-y-1.5">
					<Label className={labelClass}>{t("name.lastName")}</Label>
					<Input
						value={name.lastName}
						onChange={(e) => handleFieldChange("lastName", e.target.value)}
						placeholder={t("name.lastNamePlaceholder")}
						disabled={disabled}
						className={inputClass}
					/>
				</div>
			</div>

			{includeMiddleName && (
				<div className="space-y-1.5">
					<Label className={`${labelClass} text-muted-foreground`}>
						{t("name.middleName")}{" "}
						<span className="text-xs">
							({t("common.optional").toLowerCase()})
						</span>
					</Label>
					<Input
						value={name.middleName || ""}
						onChange={(e) => handleFieldChange("middleName", e.target.value)}
						placeholder={t("name.middleNamePlaceholder")}
						disabled={disabled}
						className={inputClass}
					/>
				</div>
			)}
		</div>
	);
}
