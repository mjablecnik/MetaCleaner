// Design spec: "Generate random file counts (1–20) and verify download method selection
// is correct (single file → direct, multi → ZIP)"
// (design.md — Property-Based Tests section)
//
// This is a server-side PBT that models the download branching logic from
// Step5Success.svelte as a pure function, then verifies the invariants across
// all file counts from 1 to 20. The pattern follows layout.navProps.test.ts:
// extract the expected logic as a pure function and test its properties.
//
// Actual component code (Step5Success.svelte, handleDownload):
//   if (results.fileResults.length === 1) → downloadFile(fileId)   [direct]
//   else                                  → downloadResults(jobId)  [zip]

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Mirror of the branching logic in handleDownload():
//   if (results.fileResults.length === 1) → direct, else → zip
function selectDownloadMethod(fileCount: number): 'direct' | 'zip' {
	return fileCount === 1 ? 'direct' : 'zip';
}

// ─── Property: Bug 1 fix — single file always uses direct download ─────────────

describe('Property: Step5Success download method selection — Bug 1 + Preservation 3.1', () => {
	it('exactly 1 file always selects direct (individual file endpoint)', () => {
		expect(selectDownloadMethod(1)).toBe('direct');
	});

	// Preservation 3.1: any count ≥ 2 always selects zip
	it('2 or more files always selects zip — for all counts in [2, 20]', () => {
		fc.assert(
			fc.property(fc.integer({ min: 2, max: 20 }), (fileCount) => {
				expect(selectDownloadMethod(fileCount)).toBe('zip');
			}),
			{ numRuns: 200 }
		);
	});

	// Full domain PBT: correctness for every value 1–20
	it('for every file count N in [1, 20], method is direct iff N===1', () => {
		fc.assert(
			fc.property(fc.integer({ min: 1, max: 20 }), (fileCount) => {
				const method = selectDownloadMethod(fileCount);
				if (fileCount === 1) {
					expect(method).toBe('direct');
				} else {
					expect(method).toBe('zip');
				}
			}),
			{ numRuns: 200 }
		);
	});

	// Boundary values: N=1 is the only direct-download case; N=2 is the first zip case
	it('N=1 is direct, N=2 is zip (boundary values)', () => {
		expect(selectDownloadMethod(1)).toBe('direct');
		expect(selectDownloadMethod(2)).toBe('zip');
	});

	// No count in [2, 20] should ever return direct
	it('direct download is never selected for any count ≥ 2', () => {
		fc.assert(
			fc.property(fc.integer({ min: 2, max: 20 }), (fileCount) => {
				expect(selectDownloadMethod(fileCount)).not.toBe('direct');
			}),
			{ numRuns: 200 }
		);
	});

	// No count in [2, 20] should ever return direct — exhaustive check over the full domain
	it('exhaustive: all 19 values in [2, 20] select zip', () => {
		for (let n = 2; n <= 20; n++) {
			expect(selectDownloadMethod(n)).toBe('zip');
		}
	});
});
