"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";
import { useDebouncedValue } from "@/lib/hooks/use-debounced";
import { MapPin, Search, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface AddressValue {
	street: string;
	street2?: string;
	city: string;
	state: string;
	zip: string;
	country: string;
}

type AutocompleteRow = {
	placeId: string;
	mainText: string;
	secondaryText: string;
};

interface AddressInputProps {
	value?: string | AddressValue;
	onChange: (value: AddressValue) => void;
	placeholder?: string;
	disabled?: boolean;
	largeText?: boolean;
	showAutocompleteToggle?: boolean;
	/** When false, hide Google autocomplete UI entirely */
	allowAutocomplete?: boolean;
	/** When true, show USPS validate control */
	allowUspsValidation?: boolean;
}

function parseInitial(value?: string | AddressValue): AddressValue {
	if (!value) {
		return {
			street: "",
			street2: "",
			city: "",
			state: "",
			zip: "",
			country: "United States",
		};
	}
	if (typeof value === "string") {
		return {
			street: value,
			street2: "",
			city: "",
			state: "",
			zip: "",
			country: "United States",
		};
	}
	return {
		street: value.street ?? "",
		street2: value.street2 ?? "",
		city: value.city ?? "",
		state: value.state ?? "",
		zip: value.zip ?? "",
		country: value.country ?? "United States",
	};
}

export function AddressInput({
	value,
	onChange,
	disabled = false,
	largeText = false,
	showAutocompleteToggle = true,
	allowAutocomplete = true,
	allowUspsValidation = false,
}: AddressInputProps) {
	const { t } = useLanguage();
	const [autocompleteEnabled, setAutocompleteEnabled] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [suggestions, setSuggestions] = useState<AutocompleteRow[]>([]);
	const [address, setAddress] = useState<AddressValue>(() =>
		parseInitial(value),
	);
	const [sessionToken] = useState(() =>
		typeof crypto !== "undefined" && crypto.randomUUID
			? crypto.randomUUID()
			: `${Date.now()}-${Math.random()}`,
	);

	const [loadingAutocomplete, setLoadingAutocomplete] = useState(false);
	const [loadingZip, setLoadingZip] = useState(false);
	const [loadingValidate, setLoadingValidate] = useState(false);

	const [uspsSuggestion, setUspsSuggestion] = useState<AddressValue | null>(
		null,
	);

	const searchRef = useRef<HTMLDivElement>(null);
	const suggestionCache = useRef<Map<string, AutocompleteRow[]>>(new Map());
	const warnedRef = useRef({
		autocomplete: false,
		zip: false,
		validate: false,
	});
	const lastZipLookup = useRef<string>("");

	const debouncedSearch = useDebouncedValue(searchQuery, 300);
	const zipDigits = address.zip.replace(/\D/g, "").slice(0, 5);
	const debouncedZip = useDebouncedValue(zipDigits, 400);

	// Click outside suggestions
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

	const valueSyncKey =
		value == null
			? ""
			: typeof value === "string"
				? `s:${value}`
				: `o:${JSON.stringify(value)}`;

	useEffect(() => {
		setAddress(parseInitial(value));
	}, [valueSyncKey]);

	const handleFieldChange = (field: keyof AddressValue, fieldValue: string) => {
		setAddress((prev) => {
			const newAddress = { ...prev, [field]: fieldValue };
			onChange(newAddress);
			return newAddress;
		});
	};

	// Google Places autocomplete
	useEffect(() => {
		if (!allowAutocomplete || !autocompleteEnabled) return;
		const q = debouncedSearch.trim();
		if (q.length < 3) {
			setSuggestions([]);
			setShowSuggestions(false);
			setLoadingAutocomplete(false);
			return;
		}

		const cacheKey = q.toLowerCase();
		const cached = suggestionCache.current.get(cacheKey);
		if (cached) {
			setSuggestions(cached);
			setShowSuggestions(true);
			setLoadingAutocomplete(false);
			return;
		}

		const ctrl = new AbortController();
		setLoadingAutocomplete(true);

		const url = `/api/address/autocomplete?q=${encodeURIComponent(q)}&sessionToken=${encodeURIComponent(sessionToken)}`;

		fetch(url, { signal: ctrl.signal })
			.then(async (res) => {
				if (!res.ok) throw new Error(String(res.status));
				return res.json() as Promise<{ suggestions?: AutocompleteRow[] }>;
			})
			.then((data) => {
				const list = data.suggestions ?? [];
				suggestionCache.current.set(cacheKey, list);
				setSuggestions(list);
				setShowSuggestions(list.length > 0);
			})
			.catch((e: unknown) => {
				if ((e as Error).name === "AbortError") return;
				if (!warnedRef.current.autocomplete) {
					toast.error(t("address.autocompleteUnavailable"));
					warnedRef.current.autocomplete = true;
				}
				setSuggestions([]);
				setShowSuggestions(false);
			})
			.finally(() => setLoadingAutocomplete(false));

		return () => ctrl.abort();
	}, [
		debouncedSearch,
		allowAutocomplete,
		autocompleteEnabled,
		sessionToken,
		t,
	]);

	// ZIP → city/state (USPS via server)
	useEffect(() => {
		if (debouncedZip.length !== 5) return;
		if (debouncedZip === lastZipLookup.current) return;

		const ctrl = new AbortController();
		setLoadingZip(true);

		fetch(`/api/address/zip-lookup?zip=${encodeURIComponent(debouncedZip)}`, {
			signal: ctrl.signal,
		})
			.then(async (res) => {
				if (!res.ok) throw new Error(String(res.status));
				return res.json() as Promise<{ city?: string; state?: string }>;
			})
			.then((data) => {
				lastZipLookup.current = debouncedZip;
				setAddress((prev) => {
					const cityEmpty = !prev.city.trim();
					const stateEmpty = !prev.state.trim();
					const next = { ...prev };
					if (cityEmpty && data.city) next.city = data.city;
					if (stateEmpty && data.state) next.state = data.state;
					onChange(next);
					return next;
				});
			})
			.catch(() => {
				if (!warnedRef.current.zip) {
					toast.warning(t("address.zipLookupFailed"));
					warnedRef.current.zip = true;
				}
			})
			.finally(() => setLoadingZip(false));

		return () => ctrl.abort();
	}, [debouncedZip, onChange, t]);

	const handleSelectSuggestion = async (row: AutocompleteRow) => {
		try {
			const res = await fetch(
				`/api/address/place-details?placeId=${encodeURIComponent(row.placeId)}`,
				{ signal: AbortSignal.timeout(8000) },
			);
			if (!res.ok) throw new Error();
			const data = (await res.json()) as {
				address?: AddressValue;
			};
			const a = data.address;
			if (!a) throw new Error();
			setAddress(a);
			onChange(a);
			setShowSuggestions(false);
			setSearchQuery("");
			setUspsSuggestion(null);
		} catch {
			toast.error(t("address.placeLookupFailed"));
		}
	};

	const runUspsValidate = async () => {
		if (!allowUspsValidation || disabled) return;
		setLoadingValidate(true);
		setUspsSuggestion(null);
		try {
			const res = await fetch("/api/address/validate", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					street: address.street,
					street2: address.street2,
					city: address.city,
					state: address.state,
					zip: address.zip,
				}),
				signal: AbortSignal.timeout(8000),
			});
			if (!res.ok) throw new Error();
			const data = (await res.json()) as {
				standardized?: AddressValue;
				changed?: boolean;
			};
			const std = data.standardized;
			if (!std) throw new Error();
			if (data.changed) {
				setUspsSuggestion(std);
			} else {
				toast.success(t("address.uspsValidated"));
			}
		} catch {
			if (!warnedRef.current.validate) {
				toast.warning(t("address.uspsUnavailable"));
				warnedRef.current.validate = true;
			}
		} finally {
			setLoadingValidate(false);
		}
	};

	const applyUspsSuggestion = () => {
		if (!uspsSuggestion) return;
		setAddress(uspsSuggestion);
		onChange(uspsSuggestion);
		setUspsSuggestion(null);
		toast.success(t("address.uspsApplied"));
	};

	const inputClass = largeText ? "text-base py-3" : "";
	const labelClass = largeText ? "text-base" : "text-sm";

	const showAutocompleteUi =
		allowAutocomplete && showAutocompleteToggle && autocompleteEnabled;

	return (
		<div className="space-y-4">
			{allowAutocomplete && showAutocompleteToggle && (
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

			{showAutocompleteUi && (
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
						{loadingAutocomplete && (
							<Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
						)}
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
							{suggestions.map((suggestion) => (
								<button
									key={suggestion.placeId}
									type="button"
									onClick={() => void handleSelectSuggestion(suggestion)}
									className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0"
								>
									<p className="font-medium text-sm">{suggestion.mainText}</p>
									<p className="text-xs text-muted-foreground">
										{suggestion.secondaryText}
									</p>
								</button>
							))}
						</div>
					)}
				</div>
			)}

			{allowUspsValidation && uspsSuggestion && (
				<div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-3 space-y-2">
					<p className="text-sm font-medium text-amber-900 dark:text-amber-100">
						{t("address.uspsSuggested")}
					</p>
					<p className="text-xs text-muted-foreground">
						{[
							uspsSuggestion.street,
							uspsSuggestion.street2,
							uspsSuggestion.city,
							uspsSuggestion.state,
							uspsSuggestion.zip,
						]
							.filter(Boolean)
							.join(", ")}
					</p>
					<div className="flex gap-2 flex-wrap">
						<Button type="button" size="sm" onClick={applyUspsSuggestion}>
							{t("address.uspsUseSuggestion")}
						</Button>
						<Button
							type="button"
							size="sm"
							variant="outline"
							onClick={() => setUspsSuggestion(null)}
						>
							{t("address.uspsKeepMine")}
						</Button>
					</div>
				</div>
			)}

			<div className="grid gap-4">
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

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="space-y-1.5">
						<Label className={labelClass}>{t("address.zip")}</Label>
						<div className="relative">
							<Input
								value={address.zip}
								onChange={(e) =>
									handleFieldChange(
										"zip",
										e.target.value.replace(/\D/g, "").slice(0, 10),
									)
								}
								placeholder={t("address.zipPlaceholder")}
								disabled={disabled}
								className={inputClass}
							/>
							{loadingZip && (
								<Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
							)}
						</div>
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

				{allowUspsValidation && (
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="secondary"
							size="sm"
							disabled={disabled || loadingValidate}
							onClick={() => void runUspsValidate()}
							className="gap-2"
						>
							{loadingValidate ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : null}
							{t("address.uspsValidate")}
						</Button>
						<span className="text-xs text-muted-foreground">
							{t("address.uspsValidateHint")}
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
