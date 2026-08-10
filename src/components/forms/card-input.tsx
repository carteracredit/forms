"use client";

import { useMemo } from "react";
import {
	CardInput as BlocksCardInput,
	type CardTokenResult,
	type CardInputLabels,
} from "@algenium/blocks";
import { toast } from "sonner";

import { useLanguage } from "@/components/LanguageProvider";
import { tokenizeCard } from "@/lib/api/cases-svc-client";

export type CardTokenValue = CardTokenResult;

interface CardInputProps {
	value?: CardTokenValue | null;
	onChange: (value: CardTokenValue | null) => void;
	disabled?: boolean;
	largeText?: boolean;
	acceptedBrands?: string[];
	requireHolderName?: boolean;
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

	const labels: CardInputLabels = useMemo(
		() => ({
			number: t("card.number"),
			expiry: t("card.expiry"),
			cvc: t("card.cvc"),
			holderName: t("card.holderName"),
			tokenize: t("card.tokenize"),
			tokenized: t("card.tokenized"),
			replace: t("card.replace"),
			invalidNumber: t("card.invalidNumber"),
			expiredCard: t("card.expiredCard"),
			invalidCvc: t("card.invalidCvc"),
			tokenizeFailed: t("card.tokenizeFailed"),
		}),
		[t],
	);

	return (
		// `BlocksCardInput` (from @algenium/blocks) renders its own PAN/CVC/expiry
		// inputs internally, so we can't pass `data-private` to them directly.
		// LogRocket treats `data-private` as inherited by descendants, so this
		// wrapper keeps the whole card entry area out of session replays.
		<div data-private>
			<BlocksCardInput
				labels={labels}
				value={value}
				onChange={onChange}
				disabled={disabled}
				largeText={largeText}
				acceptedBrands={acceptedBrands}
				requireHolderName={requireHolderName}
				tokenize={async (input) => tokenizeCard(input)}
				onError={(msg) => toast.error(msg)}
			/>
		</div>
	);
}
