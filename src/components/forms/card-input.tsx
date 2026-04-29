"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";
import valid from "card-validator";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

export type CardTokenValue = {
	tokenId: string;
	brand: string;
	last4: string;
	expMonth: number;
	expYear: number;
	masked: string;
	holderName?: string | null;
};

interface CardInputProps {
	value?: CardTokenValue | null;
	onChange: (value: CardTokenValue | null) => void;
	disabled?: boolean;
	largeText?: boolean;
	acceptedBrands?: string[];
	requireHolderName?: boolean;
}

function onlyDigits(s: string, max: number): string {
	return s.replace(/\D/g, "").slice(0, max);
}

function formatPan(digits: string): string {
	const cardInfo = valid.number(digits).card;
	const gaps = cardInfo?.gaps ?? [4, 8, 12];
	const parts: string[] = [];
	let idx = 0;
	for (const g of gaps) {
		parts.push(digits.slice(idx, g));
		idx = g;
	}
	parts.push(digits.slice(idx));
	return parts.filter((p) => p.length > 0).join(" ");
}

function parseExpiry(raw: string): { month: number; year: number } | null {
	const d = onlyDigits(raw, 4);
	if (d.length < 4) return null;
	const mm = parseInt(d.slice(0, 2), 10);
	const yy = parseInt(d.slice(2, 4), 10);
	if (mm < 1 || mm > 12) return null;
	const year = yy < 100 ? 2000 + yy : yy;
	const exp = valid.expirationDate({ month: String(mm), year: String(year) });
	if (!exp.isValid) return null;
	return { month: mm, year };
}

function normalizeBrand(detected: string | undefined): string {
	if (!detected) return "";
	if (detected === "american-express") return "amex";
	return detected;
}

function brandAllowed(
	detected: string | undefined,
	accepted?: string[],
): boolean {
	if (!accepted?.length) return true;
	if (!detected) return true;
	const n = normalizeBrand(detected);
	return accepted.map((a) => a.toLowerCase()).includes(n.toLowerCase());
}

export function CardInput({
	value,
	onChange,
	disabled = false,
	largeText = false,
	acceptedBrands,
	requireHolderName = false,
}: CardInputProps) {
	const { t } = useLanguage();
	const [panDigits, setPanDigits] = useState("");
	const [expiryRaw, setExpiryRaw] = useState("");
	const [cvc, setCvc] = useState("");
	const [holderName, setHolderName] = useState("");
	const [panFocused, setPanFocused] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const inputClass = largeText ? "text-base py-3" : "";
	const labelClass = largeText ? "text-base" : "text-sm";

	const numberValidation = valid.number(panDigits);
	const rawBrand = numberValidation.card?.type;
	const brand = normalizeBrand(rawBrand) || "unknown";
	const maxPanLen = numberValidation.card?.lengths?.slice(-1)[0] ?? 19;
	const cvcSize = rawBrand === "american-express" || brand === "amex" ? 4 : 3;

	const expiryParsed = parseExpiry(expiryRaw);
	const expiryValid =
		expiryRaw.replace(/\D/g, "").length >= 4 && expiryParsed !== null
			? valid.expirationDate({
					month: String(expiryParsed.month),
					year: String(expiryParsed.year),
				}).isValid
			: false;

	const cvvValid = cvc.length >= cvcSize && valid.cvv(cvc, cvcSize).isValid;

	const panComplete =
		numberValidation.isValid && brandAllowed(rawBrand, acceptedBrands);

	const holderOk = !requireHolderName || holderName.trim().length > 1;

	const canSubmit =
		panComplete && expiryValid && cvvValid && holderOk && !disabled && !value;

	const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const d = onlyDigits(e.target.value, maxPanLen);
		setPanDigits(d);
	};

	const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let d = onlyDigits(e.target.value, 4);
		if (d.length >= 2) d = d.slice(0, 2) + "/" + d.slice(2);
		setExpiryRaw(d);
	};

	const tokenize = useCallback(async () => {
		if (!expiryParsed) return;
		setSubmitting(true);
		try {
			const res = await fetch("/api/cards/tokenize", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					pan: panDigits,
					expMonth: expiryParsed.month,
					expYear: expiryParsed.year,
					cvc,
					holderName: holderName.trim() || undefined,
				}),
			});

			const data = (await res.json().catch(() => ({}))) as {
				success?: boolean;
				result?: CardTokenValue;
				errors?: Array<{ message?: string }>;
				error?: string;
			};

			if (!res.ok || !data.success || !data.result) {
				const msg =
					data.errors?.[0]?.message ?? data.error ?? t("card.tokenizeFailed");
				toast.error(msg);
				return;
			}

			onChange(data.result);
			setPanDigits("");
			setExpiryRaw("");
			setCvc("");
			setHolderName("");
			toast.success(t("card.tokenized"));
		} catch {
			toast.error(t("card.tokenizeFailed"));
		} finally {
			setSubmitting(false);
		}
	}, [cvc, expiryParsed, holderName, onChange, panDigits, t]);

	const displayPan =
		panFocused || panDigits.length <= 4
			? formatPan(panDigits)
			: `•••• •••• •••• ${panDigits.slice(-4)}`;

	if (value?.tokenId) {
		return (
			<div className="space-y-3 rounded-lg border bg-muted/30 p-4">
				<div className="flex items-center gap-2 text-sm">
					<CreditCard className="h-4 w-4 text-muted-foreground" />
					<span className="font-medium">{value.masked}</span>
					<span className="text-muted-foreground">
						{String(value.expMonth).padStart(2, "0")}/
						{String(value.expYear).slice(-2)}
					</span>
				</div>
				{value.holderName ? (
					<p className="text-xs text-muted-foreground">{value.holderName}</p>
				) : null}
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={disabled}
					onClick={() => onChange(null)}
				>
					{t("card.replace")}
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-4 rounded-lg border bg-card p-4">
			<div className="space-y-1.5">
				<Label className={labelClass}>{t("card.number")}</Label>
				<Input
					inputMode="numeric"
					autoComplete="cc-number"
					value={displayPan}
					onChange={handlePanChange}
					onFocus={() => setPanFocused(true)}
					onBlur={() => setPanFocused(false)}
					placeholder="4242 4242 4242 4242"
					disabled={disabled}
					className={inputClass}
				/>
				{panDigits.length > 0 && !numberValidation.isPotentiallyValid && (
					<p className="text-xs text-destructive">{t("card.invalidNumber")}</p>
				)}
				{panDigits.length > 0 &&
					numberValidation.isPotentiallyValid &&
					!brandAllowed(rawBrand, acceptedBrands) && (
						<p className="text-xs text-destructive">
							{t("card.invalidNumber")}
						</p>
					)}
			</div>

			{requireHolderName && (
				<div className="space-y-1.5">
					<Label className={labelClass}>{t("card.holderName")}</Label>
					<Input
						autoComplete="cc-name"
						value={holderName}
						onChange={(e) => setHolderName(e.target.value)}
						disabled={disabled}
						className={inputClass}
					/>
				</div>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="space-y-1.5">
					<Label className={labelClass}>{t("card.expiry")}</Label>
					<Input
						inputMode="numeric"
						autoComplete="cc-exp"
						value={expiryRaw}
						onChange={handleExpiryChange}
						placeholder="MM/YY"
						disabled={disabled}
						className={inputClass}
					/>
					{expiryRaw.replace(/\D/g, "").length >= 4 && !expiryValid && (
						<p className="text-xs text-destructive">{t("card.expiredCard")}</p>
					)}
				</div>
				<div className="space-y-1.5">
					<Label className={labelClass}>{t("card.cvc")}</Label>
					<Input
						inputMode="numeric"
						autoComplete="cc-csc"
						value={cvc}
						onChange={(e) => setCvc(onlyDigits(e.target.value, cvcSize))}
						placeholder={cvcSize === 4 ? "0000" : "000"}
						disabled={disabled}
						className={inputClass}
						maxLength={cvcSize}
					/>
					{cvc.length > 0 && !cvvValid && (
						<p className="text-xs text-destructive">{t("card.invalidCvc")}</p>
					)}
				</div>
			</div>

			<Button
				type="button"
				disabled={!canSubmit || submitting}
				onClick={() => void tokenize()}
				className="gap-2"
			>
				{submitting ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<CreditCard className="h-4 w-4" />
				)}
				{t("card.tokenize")}
			</Button>
		</div>
	);
}
