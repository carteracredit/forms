"use client";

import type { FormField } from "@/lib/types/form";
import { useLanguage } from "@/components/LanguageProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { PhoneInput } from "@/components/forms/phone-input";
import { AddressInput } from "@/components/forms/address-input";
import { Star } from "lucide-react";
import { useState } from "react";

interface FormFieldRendererProps {
	field: FormField;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onChange: (fieldId: string, value: any) => void;
	onCheckboxGroupChange?: (
		fieldId: string,
		option: string,
		checked: boolean,
	) => void;
	largeText?: boolean;
	compact?: boolean;
}

export function FormFieldRenderer({
	field,
	value,
	onChange,
	onCheckboxGroupChange,
	largeText = false,
	compact = false,
}: FormFieldRendererProps) {
	const { getFieldLabel, getFieldPlaceholder, t } = useLanguage();
	const labelClass = largeText ? "text-base" : "text-sm";
	const inputClass = largeText ? "text-base py-3" : "";
	const [hoveredRating, setHoveredRating] = useState(0);

	const fieldLabel = getFieldLabel(field.label, field.labelEs);
	const fieldPlaceholder = getFieldPlaceholder(
		field.placeholder,
		field.placeholderEs,
	);

	switch (field.type) {
		case "name":
		case "text":
			return (
				<div className="space-y-2">
					<Label className={labelClass}>
						{fieldLabel}
						{field.required && <span className="text-destructive ml-1">*</span>}
					</Label>
					<Input
						value={value || ""}
						onChange={(e) => onChange(field.id, e.target.value)}
						placeholder={fieldPlaceholder}
						required={field.required}
						className={inputClass}
					/>
				</div>
			);

		case "textarea":
			return (
				<div className="space-y-2">
					<Label className={labelClass}>
						{fieldLabel}
						{field.required && <span className="text-destructive ml-1">*</span>}
					</Label>
					<Textarea
						value={value || ""}
						onChange={(e) => onChange(field.id, e.target.value)}
						placeholder={fieldPlaceholder}
						required={field.required}
						className={inputClass}
						rows={compact ? 2 : 4}
					/>
				</div>
			);

		case "email":
			return (
				<div className="space-y-2">
					<Label className={labelClass}>
						{fieldLabel}
						{field.required && <span className="text-destructive ml-1">*</span>}
					</Label>
					<Input
						type="email"
						value={value || ""}
						onChange={(e) => onChange(field.id, e.target.value)}
						placeholder={fieldPlaceholder}
						required={field.required}
						className={inputClass}
					/>
				</div>
			);

		case "phone":
			return (
				<div className="space-y-2">
					<Label className={labelClass}>
						{fieldLabel}
						{field.required && <span className="text-destructive ml-1">*</span>}
					</Label>
					<PhoneInput
						value={value || ""}
						onChange={(val) => onChange(field.id, val)}
						placeholder={fieldPlaceholder || t("phone.placeholder")}
						largeText={largeText}
					/>
				</div>
			);

		case "address":
			return (
				<div className="space-y-2">
					<Label className={labelClass}>
						{fieldLabel}
						{field.required && <span className="text-destructive ml-1">*</span>}
					</Label>
					{compact ? (
						<Input
							value={typeof value === "string" ? value : value?.street || ""}
							onChange={(e) => onChange(field.id, e.target.value)}
							placeholder={fieldPlaceholder || t("address.streetPlaceholder")}
							className={inputClass}
						/>
					) : (
						<AddressInput
							value={value}
							onChange={(val) => onChange(field.id, val)}
							largeText={largeText}
							showAutocompleteToggle={!compact}
						/>
					)}
				</div>
			);

		case "file":
			return (
				<div className="space-y-2">
					<Label className={labelClass}>
						{fieldLabel}
						{field.required && <span className="text-destructive ml-1">*</span>}
					</Label>
					<Input
						type="file"
						onChange={(e) =>
							onChange(field.id, e.target.files?.[0]?.name || "")
						}
						required={field.required}
						className={inputClass}
					/>
				</div>
			);

		case "checkbox":
			return (
				<div className="flex items-center space-x-2">
					<Checkbox
						id={field.id}
						checked={value || false}
						onCheckedChange={(checked) => onChange(field.id, checked)}
						required={field.required}
					/>
					<Label htmlFor={field.id} className={`cursor-pointer ${labelClass}`}>
						{fieldLabel}
						{field.required && <span className="text-destructive ml-1">*</span>}
					</Label>
				</div>
			);

		case "radio":
			return (
				<div className="space-y-2">
					<Label className={labelClass}>
						{fieldLabel}
						{field.required && <span className="text-destructive ml-1">*</span>}
					</Label>
					<RadioGroup
						value={value || ""}
						onValueChange={(val) => onChange(field.id, val)}
						className={compact ? "flex flex-wrap gap-x-4 gap-y-2" : "space-y-2"}
					>
						{field.options?.map((option) => (
							<div key={option} className="flex items-center space-x-2">
								<RadioGroupItem value={option} id={`${field.id}-${option}`} />
								<Label
									htmlFor={`${field.id}-${option}`}
									className={`cursor-pointer font-normal ${labelClass}`}
								>
									{option}
								</Label>
							</div>
						))}
					</RadioGroup>
				</div>
			);

		case "checkbox-group":
			return (
				<div className="space-y-2">
					<Label className={labelClass}>
						{fieldLabel}
						{field.required && <span className="text-destructive ml-1">*</span>}
					</Label>
					<div
						className={compact ? "flex flex-wrap gap-x-4 gap-y-2" : "space-y-2"}
					>
						{field.options?.map((option) => (
							<div key={option} className="flex items-center space-x-2">
								<Checkbox
									id={`${field.id}-${option}`}
									checked={(value || []).includes(option)}
									onCheckedChange={(checked) => {
										if (onCheckboxGroupChange) {
											onCheckboxGroupChange(
												field.id,
												option,
												checked as boolean,
											);
										} else {
											const current = value || [];
											const newValue = checked
												? [...current, option]
												: current.filter((o: string) => o !== option);
											onChange(field.id, newValue);
										}
									}}
								/>
								<Label
									htmlFor={`${field.id}-${option}`}
									className={`cursor-pointer font-normal ${labelClass}`}
								>
									{option}
								</Label>
							</div>
						))}
					</div>
				</div>
			);

		case "dropdown":
			return (
				<div className="space-y-2">
					<Label className={labelClass}>
						{fieldLabel}
						{field.required && <span className="text-destructive ml-1">*</span>}
					</Label>
					<Select
						value={value || ""}
						onValueChange={(val) => onChange(field.id, val)}
					>
						<SelectTrigger className={inputClass}>
							<SelectValue
								placeholder={fieldPlaceholder || t("common.select")}
							/>
						</SelectTrigger>
						<SelectContent>
							{field.options?.map((option) => (
								<SelectItem key={option} value={option}>
									{option}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			);

		case "number":
			return (
				<div className="space-y-2">
					<Label className={labelClass}>
						{fieldLabel}
						{field.required && <span className="text-destructive ml-1">*</span>}
					</Label>
					<Input
						type="number"
						value={value || ""}
						onChange={(e) => onChange(field.id, e.target.value)}
						placeholder={fieldPlaceholder}
						required={field.required}
						className={inputClass}
						min={field.validation?.min}
						max={field.validation?.max}
					/>
				</div>
			);

		case "url":
			return (
				<div className="space-y-2">
					<Label className={labelClass}>
						{fieldLabel}
						{field.required && <span className="text-destructive ml-1">*</span>}
					</Label>
					<Input
						type="url"
						value={value || ""}
						onChange={(e) => onChange(field.id, e.target.value)}
						placeholder={fieldPlaceholder || "https://example.com"}
						required={field.required}
						className={inputClass}
					/>
				</div>
			);

		case "password":
			return (
				<div className="space-y-2">
					<Label className={labelClass}>
						{fieldLabel}
						{field.required && <span className="text-destructive ml-1">*</span>}
					</Label>
					<Input
						type="password"
						value={value || ""}
						onChange={(e) => onChange(field.id, e.target.value)}
						placeholder={fieldPlaceholder}
						required={field.required}
						className={inputClass}
					/>
				</div>
			);

		case "time":
			return (
				<div className="space-y-2">
					<Label className={labelClass}>
						{fieldLabel}
						{field.required && <span className="text-destructive ml-1">*</span>}
					</Label>
					<Input
						type="time"
						value={value || ""}
						onChange={(e) => onChange(field.id, e.target.value)}
						required={field.required}
						className={inputClass}
					/>
				</div>
			);

		case "rating": {
			const maxRating = field.properties?.maxRating || 5;
			const allowHalf = field.properties?.allowHalf || false;
			const currentValue = value || 0;

			return (
				<div className="space-y-2">
					<Label className={labelClass}>
						{fieldLabel}
						{field.required && <span className="text-destructive ml-1">*</span>}
					</Label>
					<div className="flex gap-1">
						{Array.from({ length: maxRating }, (_, i) => i + 1).map(
							(rating) => {
								const hoverOrValue = hoveredRating || currentValue;
								const isFullStar = rating <= hoverOrValue;
								const isHalfStar =
									allowHalf &&
									rating === Math.ceil(hoverOrValue) &&
									hoverOrValue > rating - 1 &&
									hoverOrValue < rating;

								return (
									<button
										key={rating}
										type="button"
										onClick={(e) => {
											e.preventDefault();
											if (allowHalf) {
												if (currentValue === rating) {
													onChange(field.id, rating - 0.5);
												} else if (currentValue === rating - 0.5) {
													onChange(field.id, 0);
												} else {
													onChange(field.id, rating);
												}
											} else {
												onChange(
													field.id,
													currentValue === rating ? 0 : rating,
												);
											}
										}}
										onMouseEnter={() => setHoveredRating(rating)}
										onMouseLeave={() => setHoveredRating(0)}
										className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded relative cursor-pointer"
										aria-label={`Rate ${rating} ${allowHalf ? "star" : "stars"}`}
									>
										<Star
											className={`h-6 w-6 transition-colors ${
												isFullStar
													? "fill-yellow-400 text-yellow-400"
													: "text-muted-foreground"
											}`}
										/>
										{allowHalf && isHalfStar && (
											<div
												className="absolute inset-0 overflow-hidden"
												style={{ width: "50%" }}
											>
												<Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
											</div>
										)}
									</button>
								);
							},
						)}
						{currentValue > 0 && (
							<span className="ml-2 text-sm text-muted-foreground self-center">
								{currentValue} / {maxRating}
							</span>
						)}
					</div>
				</div>
			);
		}

		case "date":
			return (
				<div className="space-y-2">
					<Label className={labelClass}>
						{fieldLabel}
						{field.required && <span className="text-destructive ml-1">*</span>}
					</Label>
					<Input
						type="date"
						value={value || ""}
						onChange={(e) => onChange(field.id, e.target.value)}
						required={field.required}
						className={inputClass}
					/>
				</div>
			);

		case "datetime":
			return (
				<div className="space-y-2">
					<Label className={labelClass}>
						{fieldLabel}
						{field.required && <span className="text-destructive ml-1">*</span>}
					</Label>
					<Input
						type="datetime-local"
						value={value || ""}
						onChange={(e) => onChange(field.id, e.target.value)}
						required={field.required}
						className={inputClass}
					/>
				</div>
			);

		default:
			return null;
	}
}
