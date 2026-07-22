import { describe, expect, it, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedValue } from "./use-debounced";

describe("useDebouncedValue", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns initial value immediately", () => {
		vi.useFakeTimers();
		const { result } = renderHook(() => useDebouncedValue("a", 100));
		expect(result.current).toBe("a");
	});

	it("updates debounced value after delay", () => {
		vi.useFakeTimers();
		const { result, rerender } = renderHook(
			({ v, d }: { v: string; d: number }) => useDebouncedValue(v, d),
			{ initialProps: { v: "x", d: 50 } },
		);
		expect(result.current).toBe("x");
		rerender({ v: "y", d: 50 });
		expect(result.current).toBe("x");
		act(() => {
			vi.advanceTimersByTime(50);
		});
		expect(result.current).toBe("y");
	});

	it("cancels pending update when value changes again before delay", () => {
		vi.useFakeTimers();
		const { result, rerender } = renderHook(
			({ v }: { v: string }) => useDebouncedValue(v, 100),
			{ initialProps: { v: "one" } },
		);
		rerender({ v: "two" });
		act(() => {
			vi.advanceTimersByTime(40);
		});
		rerender({ v: "three" });
		act(() => {
			vi.advanceTimersByTime(40);
		});
		expect(result.current).toBe("one");
		act(() => {
			vi.advanceTimersByTime(60);
		});
		expect(result.current).toBe("three");
	});
});
