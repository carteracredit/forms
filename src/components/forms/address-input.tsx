"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/components/LanguageProvider";
import { MapPin, Search, X } from "lucide-react";

export interface AddressValue {
	street: string;
	street2?: string;
	city: string;
	state: string;
	zip: string;
	country: string;
}

interface AddressInputProps {
	value?: string | AddressValue;
	onChange: (value: AddressValue) => void;
	placeholder?: string;
	disabled?: boolean;
	largeText?: boolean;
	showAutocompleteToggle?: boolean;
}

// Mock autocomplete suggestions
const mockSuggestions = [
	{
		street: "123 Main Street",
		city: "San Francisco",
		state: "CA",
		zip: "94102",
		country: "United States",
	},
	{
		street: "456 Oak Avenue",
		city: "Los Angeles",
		state: "CA",
		zip: "90001",
		country: "United States",
	},
	{
		street: "789 Pine Boulevard",
		city: "New York",
		state: "NY",
		zip: "10001",
		country: "United States",
	},
	{
		street: "321 Elm Drive",
		city: "Chicago",
		state: "IL",
		zip: "60601",
		country: "United States",
	},
	{
		street: "654 Maple Lane",
		city: "Seattle",
		state: "WA",
		zip: "98101",
		country: "United States",
	},
];

export function AddressInput({
	value,
	onChange,
	disabled = false,
	largeText = false,
	showAutocompleteToggle = true,
}: AddressInputProps) {
	const { t } = useLanguage();
	const [autocompleteEnabled, setAutocompleteEnabled] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [suggestions, setSuggestions] = useState<AddressValue[]>([]);
	const [address, setAddress] = useState<AddressValue>({
		street: "",
		street2: "",
		city: "",
		state: "",
		zip: "",
		country: "United States",
	});
	const searchRef = useRef<HTMLDivElement>(null);

	// Parse initial value
	useEffect(() => {
		if (value) {
			if (typeof value === "string") {
				setAddress({ ...address, street: value });
			} else {
				setAddress({ ...address, ...value });
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Handle click outside to close suggestions
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				searchRef.current &&
				!searchRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Mock search functionality
	useEffect(() => {
		if (searchQuery.length > 2 && autocompleteEnabled) {
			const filtered = mockSuggestions.filter(
				(s) =>
					s.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
					s.city.toLowerCase().includes(searchQuery.toLowerCase()),
			);
			setSuggestions(
				filtered.length > 0 ? filtered : mockSuggestions.slice(0, 3),
			);
			setShowSuggestions(true);
		} else {
			setShowSuggestions(false);
		}
	}, [searchQuery, autocompleteEnabled]);

	const handleFieldChange = (field: keyof AddressValue, fieldValue: string) => {
		const newAddress = { ...address, [field]: fieldValue };
		setAddress(newAddress);
		onChange(newAddress);
	};

	const handleSelectSuggestion = (suggestion: AddressValue) => {
		setAddress(suggestion);
		onChange(suggestion);
		setShowSuggestions(false);
		setSearchQuery("");
	};

	const inputClass = largeText ? "text-base py-3" : "";
	const labelClass = largeText ? "text-base" : "text-sm";

	return (
		<div className="space-y-4">
			{/* Autocomplete Toggle */}
			{showAutocompleteToggle && (
				<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
					<div className="flex items-center gap-2">
						<MapPin className="h-4 w-4 text-muted-foreground" />
						<div>
							<p className={`font-medium ${labelClass}`}>
								{t("address.autocomplete")}
							</p>
							<p className="text-xs text-muted-foreground">
								{t("address.autocompleteDesc")}
							</p>
						</div>
					</div>
					<Switch
						checked={autocompleteEnabled}
						onCheckedChange={setAutocompleteEnabled}
						disabled={disabled}
						aria-label={t("address.autocomplete")}
					/>
				</div>
			)}

			{/* Autocomplete Search */}
			{autocompleteEnabled && (
				<div ref={searchRef} className="relative">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder={t("common.search") + "..."}
							disabled={disabled}
							className={`pl-9 pr-9 ${inputClass}`}
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</div>
					{showSuggestions && suggestions.length > 0 && (
						<div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-48 overflow-y-auto">
							{suggestions.map((suggestion, index) => (
								<button
									key={index}
									type="button"
									onClick={() => handleSelectSuggestion(suggestion)}
									className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0"
								>
									<p className="font-medium text-sm">{suggestion.street}</p>
									<p className="text-xs text-muted-foreground">
										{suggestion.city}, {suggestion.state} {suggestion.zip}
									</p>
								</button>
							))}
						</div>
					)}
				</div>
			)}

			{/* Address Fields */}
			<div className="grid gap-4">
				{/* Street Address */}
				<div className="space-y-1.5">
					<Label className={labelClass}>{t("address.street")}</Label>
					<Input
						value={address.street}
						onChange={(e) => handleFieldChange("street", e.target.value)}
						placeholder={t("address.streetPlaceholder")}
						disabled={disabled}
						className={inputClass}
					/>
				</div>

				{/* Street Address Line 2 */}
				<div className="space-y-1.5">
					<Label className={`${labelClass} text-muted-foreground`}>
						{t("address.street2")}{" "}
						<span className="text-xs">
							({t("common.optional").toLowerCase()})
						</span>
					</Label>
					<Input
						value={address.street2 || ""}
						onChange={(e) => handleFieldChange("street2", e.target.value)}
						placeholder={t("address.street2Placeholder")}
						disabled={disabled}
						className={inputClass}
					/>
				</div>

				{/* City and State */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="space-y-1.5">
						<Label className={labelClass}>{t("address.city")}</Label>
						<Input
							value={address.city}
							onChange={(e) => handleFieldChange("city", e.target.value)}
							placeholder={t("address.cityPlaceholder")}
							disabled={disabled}
							className={inputClass}
						/>
					</div>
					<div className="space-y-1.5">
						<Label className={labelClass}>{t("address.state")}</Label>
						<Input
							value={address.state}
							onChange={(e) => handleFieldChange("state", e.target.value)}
							placeholder={t("address.statePlaceholder")}
							disabled={disabled}
							className={inputClass}
						/>
					</div>
				</div>

				{/* ZIP and Country */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="space-y-1.5">
						<Label className={labelClass}>{t("address.zip")}</Label>
						<Input
							value={address.zip}
							onChange={(e) => handleFieldChange("zip", e.target.value)}
							placeholder={t("address.zipPlaceholder")}
							disabled={disabled}
							className={inputClass}
						/>
					</div>
					<div className="space-y-1.5">
						<Label className={labelClass}>{t("address.country")}</Label>
						<Input
							value={address.country}
							onChange={(e) => handleFieldChange("country", e.target.value)}
							placeholder={t("address.countryPlaceholder")}
							disabled={disabled}
							className={inputClass}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
