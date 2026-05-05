"use client";

import { useMemo } from "react";
import {
	USAddressInput,
	type AddressAutocompleteAdapter,
	type USAddressInputLabels,
	type USAddressValue,
} from "@algenium/blocks";
import { toast } from "sonner";

import { useLanguage } from "@/components/LanguageProvider";
import {
	autocompleteAddress,
	lookupZip,
	placeDetailsAddress,
	validateAddressUs,
} from "@/lib/api/cases-svc-client";

/** @deprecated Use {@link USAddressValue}; kept for form schema compatibility. */
export type AddressValue = USAddressValue;

interface AddressInputProps {
	value?: string | USAddressValue;
	onChange: (value: USAddressValue) => void;
	placeholder?: string;
	disabled?: boolean;
	largeText?: boolean;
	showAutocompleteToggle?: boolean;
	allowAutocomplete?: boolean;
	allowUspsValidation?: boolean;
}

function parseInitial(value?: string | USAddressValue): USAddressValue {
	if (!value) {
		return {
			street: "",
			street2: "",
			city: "",
			state: "",
			zip: "",
			country: "US",
		};
	}
	if (typeof value === "string") {
		return {
			street: value,
			street2: "",
			city: "",
			state: "",
			zip: "",
			country: "US",
		};
	}
	return {
		street: value.street ?? "",
		street2: value.street2 ?? "",
		city: value.city ?? "",
		state: value.state ?? "",
		zip: value.zip ?? "",
		country: "US",
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

	const labels: USAddressInputLabels = useMemo(
		() => ({
			street: t("address.street"),
			street2: t("address.street2"),
			city: t("address.city"),
			state: t("address.state"),
			zip: t("address.zip"),
			searchPlaceholder: `${t("common.search")}…`,
			uspsValidate: t("address.uspsValidate"),
			uspsValidating: t("address.uspsValidating"),
			uspsSuggested: t("address.uspsSuggested"),
			uspsUseSuggestion: t("address.uspsUseSuggestion"),
			uspsKeepMine: t("address.uspsKeepMine"),
			uspsApplied: t("address.uspsApplied"),
			uspsUnavailable: t("address.uspsUnavailable"),
			zipLookupFailed: t("address.zipLookupFailed"),
			placeLookupFailed: t("address.placeLookupFailed"),
			autocompleteUnavailable: t("address.autocompleteUnavailable"),
			autocompleteTitle: t("address.autocomplete"),
			autocompleteDescription: t("address.autocompleteDesc"),
			streetPlaceholder: t("address.streetPlaceholder"),
			street2Placeholder: t("address.street2Placeholder"),
			cityPlaceholder: t("address.cityPlaceholder"),
			statePlaceholder: t("address.statePlaceholder"),
			zipPlaceholder: t("address.zipPlaceholder"),
			street2OptionalHint: t("common.optional"),
			countryLabel: t("address.country"),
		}),
		[t],
	);

	const autocomplete: AddressAutocompleteAdapter | undefined = useMemo(() => {
		if (!allowAutocomplete) return undefined;
		return {
			search: (q, sessionToken, signal) =>
				autocompleteAddress(q, sessionToken, signal),
			details: (placeId, signal) => placeDetailsAddress(placeId, signal),
		};
	}, [allowAutocomplete]);

	const controlled = parseInitial(value);

	return (
		<USAddressInput
			labels={labels}
			value={controlled}
			onChange={onChange}
			disabled={disabled}
			largeText={largeText}
			showAutocompleteToggle={showAutocompleteToggle}
			lookupZip={(zip, signal) => lookupZip(zip, signal)}
			validateAddress={
				allowUspsValidation
					? (addr, signal) =>
							validateAddressUs(
								{
									street: addr.street,
									street2: addr.street2,
									city: addr.city,
									state: addr.state,
									zip: addr.zip,
								},
								signal,
							)
					: undefined
			}
			autocomplete={autocomplete}
			onError={(msg) => toast.error(msg)}
		/>
	);
}
