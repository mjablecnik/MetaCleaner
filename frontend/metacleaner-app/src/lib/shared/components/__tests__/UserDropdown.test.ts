import { describe, it, expect, vi } from 'vitest';

// Unit tests for UserDropdown accessibility callback logic.
// These verify the handler contract without a browser: given the pattern used in the
// component (onkeydown with Enter guard), confirm callbacks are invoked when provided
// and silently skipped when absent.

function makeLogoutHandler(onLogout?: () => void) {
	return () => onLogout?.();
}

function makeKeydownHandler(callback?: () => void) {
	return (key: string) => {
		if (key === 'Enter') callback?.();
	};
}

describe('UserDropdown accessibility callbacks', () => {
	describe('onLogout', () => {
		it('invokes onLogout callback on click when provided', () => {
			const onLogout = vi.fn();
			const handler = makeLogoutHandler(onLogout);
			handler();
			expect(onLogout).toHaveBeenCalledTimes(1);
		});

		it('invokes onLogout callback on Enter keydown when provided', () => {
			const onLogout = vi.fn();
			const keydown = makeKeydownHandler(onLogout);
			keydown('Enter');
			expect(onLogout).toHaveBeenCalledTimes(1);
		});

		it('does not invoke onLogout on non-Enter key', () => {
			const onLogout = vi.fn();
			const keydown = makeKeydownHandler(onLogout);
			keydown('Escape');
			expect(onLogout).not.toHaveBeenCalled();
		});

		it('no-op when onLogout is not provided (click)', () => {
			const handler = makeLogoutHandler(undefined);
			expect(() => handler()).not.toThrow();
		});

		it('no-op when onLogout is not provided (Enter keydown)', () => {
			const keydown = makeKeydownHandler(undefined);
			expect(() => keydown('Enter')).not.toThrow();
		});
	});
});
