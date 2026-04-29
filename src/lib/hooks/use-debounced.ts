"use client";

import { useEffect, useState } from "react";

/**
 * Debounces a value — updates `debounced` after `delayMs` of stability.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const id = window.setTimeout(() => setDebounced(value), delayMs);
		return () => window.clearTimeout(id);
	}, [value, delayMs]);

	return debounced;
}
