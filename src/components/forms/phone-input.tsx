"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/components/LanguageProvider";
import { ChevronDown } from "lucide-react";

// Common country codes with flags
const countries = [
	{
		code: "US",
		dialCode: "+1",
		flag: "🇺🇸",
		name: "United States",
		nameEs: "Estados Unidos",
	},
	{
		code: "GB",
		dialCode: "+44",
		flag: "🇬🇧",
		name: "United Kingdom",
		nameEs: "Reino Unido",
	},
	{ code: "CA", dialCode: "+1", flag: "🇨🇦", name: "Canada", nameEs: "Canadá" },
	{
		code: "AU",
		dialCode: "+61",
		flag: "🇦🇺",
		name: "Australia",
		nameEs: "Australia",
	},
	{
		code: "DE",
		dialCode: "+49",
		flag: "🇩🇪",
		name: "Germany",
		nameEs: "Alemania",
	},
	{
		code: "FR",
		dialCode: "+33",
		flag: "🇫🇷",
		name: "France",
		nameEs: "Francia",
	},
	{ code: "ES", dialCode: "+34", flag: "🇪🇸", name: "Spain", nameEs: "España" },
	{ code: "IT", dialCode: "+39", flag: "🇮🇹", name: "Italy", nameEs: "Italia" },
	{ code: "JP", dialCode: "+81", flag: "🇯🇵", name: "Japan", nameEs: "Japón" },
	{ code: "CN", dialCode: "+86", flag: "🇨🇳", name: "China", nameEs: "China" },
	{ code: "IN", dialCode: "+91", flag: "🇮🇳", name: "India", nameEs: "India" },
	{ code: "BR", dialCode: "+55", flag: "🇧🇷", name: "Brazil", nameEs: "Brasil" },
	{ code: "MX", dialCode: "+52", flag: "🇲🇽", name: "Mexico", nameEs: "México" },
	{
		code: "KR",
		dialCode: "+82",
		flag: "🇰🇷",
		name: "South Korea",
		nameEs: "Corea del Sur",
	},
	{ code: "RU", dialCode: "+7", flag: "🇷🇺", name: "Russia", nameEs: "Rusia" },
];

interface PhoneInputProps {
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	largeText?: boolean;
}

export function PhoneInput({
	value = "",
	onChange,
	placeholder,
	disabled = false,
	className = "",
	largeText = false,
}: PhoneInputProps) {
	const { t, language } = useLanguage();
	const [selectedCountry, setSelectedCountry] = useState(countries[0]);
	const [phoneNumber, setPhoneNumber] = useState("");

	// Parse initial value
	useEffect(() => {
		if (value) {
			// Try to detect country from value
			const matchedCountry = countries.find((c) =>
				value.startsWith(c.dialCode),
			);
			if (matchedCountry) {
				setSelectedCountry(matchedCountry);
				setPhoneNumber(value.replace(matchedCountry.dialCode, "").trim());
			} else {
				setPhoneNumber(value);
			}
		}
	}, []);

	const formatPhoneNumber = (input: string): string => {
		// Remove all non-digits
		const digits = input.replace(/\D/g, "");

		// Format based on length (US format as example)
		if (digits.length <= 3) {
			return digits;
		} else if (digits.length <= 6) {
			return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
		} else {
			return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
		}
	};

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const rawValue = e.target.value.replace(/\D/g, "").slice(0, 10);
		const formatted = formatPhoneNumber(rawValue);
		setPhoneNumber(formatted);
		onChange(`${selectedCountry.dialCode} ${formatted}`);
	};

	const handleCountryChange = (country: (typeof countries)[0]) => {
		setSelectedCountry(country);
		if (phoneNumber) {
			onChange(`${country.dialCode} ${phoneNumber}`);
		}
	};

	const getCountryName = (country: (typeof countries)[0]) => {
		return language === "es" ? country.nameEs : country.name;
	};

	return (
		<div className={`flex ${className}`}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild disabled={disabled}>
					<Button
						type="button"
						variant="outline"
						className={`rounded-r-none border-r-0 px-2 sm:px-3 shrink-0 ${largeText ? "text-base h-11" : ""}`}
					>
						<span className="text-base sm:text-lg mr-1">
							{selectedCountry.flag}
						</span>
						<span className="hidden sm:inline text-xs text-muted-foreground">
							{selectedCountry.dialCode}
						</span>
						<ChevronDown className="h-3 w-3 ml-1 opacity-50" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
					{countries.map((country) => (
						<DropdownMenuItem
							key={country.code}
							onClick={() => handleCountryChange(country)}
							className="flex items-center gap-2"
						>
							<span className="text-lg">{country.flag}</span>
							<span className="flex-1">{getCountryName(country)}</span>
							<span className="text-xs text-muted-foreground">
								{country.dialCode}
							</span>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
			<Input
				type="tel"
				value={phoneNumber}
				onChange={handlePhoneChange}
				placeholder={placeholder || t("phone.placeholder")}
				disabled={disabled}
				className={`rounded-l-none flex-1 min-w-0 ${largeText ? "text-base py-3" : ""}`}
			/>
		</div>
	);
}
