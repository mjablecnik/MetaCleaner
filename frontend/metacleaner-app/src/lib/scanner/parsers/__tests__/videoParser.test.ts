import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock mediainfo.js dynamic import — vi.mock is hoisted before all imports.
vi.mock('mediainfo.js', () => ({
	default: vi.fn()
}));

import * as MediaInfoModule from 'mediainfo.js';

const mockFactory = vi.mocked(MediaInfoModule.default);

// ─── Bug Condition 7: parseVideo should handle mediainfo.js failures gracefully

describe('Bug Condition 7: parseVideo handles mediainfo.js failures gracefully', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// EXPECTED OUTCOME: FAILS on unfixed code (error propagates, promise rejects)
	it('parseVideo resolves with empty result when factory init throws (EXPECTED BEHAVIOR)', async () => {
		// Reset module so mediaInfoInstance starts as null for this test
		vi.resetModules();
		vi.mock('mediainfo.js', () => ({ default: vi.fn() }));

		const { parseVideo } = await import('../videoParser.js');
		const freshFactory = vi.mocked((await import('mediainfo.js')).default);
		freshFactory.mockRejectedValueOnce(new Error('WASM initialization failed'));

		const file = new File(['fake video data'], 'test.mp4', { type: 'video/mp4' });

		// Bug 7: parseVideo() propagates the error instead of returning empty result
		// On unfixed code: rejects with "WASM initialization failed"
		// On fixed code: resolves { status: 'done', fieldCount: 0, hasGps: false }
		await expect(parseVideo(file, 'file-bug7-init')).resolves.toMatchObject({
			status: 'done',
			fileId: 'file-bug7-init',
			fieldCount: 0,
			hasGps: false
		});
	});

	// EXPECTED OUTCOME: FAILS on unfixed code (analyzeData error propagates, promise rejects)
	it('parseVideo resolves with empty result when analyzeData throws (EXPECTED BEHAVIOR)', async () => {
		vi.resetModules();
		vi.mock('mediainfo.js', () => ({ default: vi.fn() }));

		const { parseVideo } = await import('../videoParser.js');
		const freshFactory = vi.mocked((await import('mediainfo.js')).default);

		const mockMi = {
			analyzeData: vi.fn().mockRejectedValueOnce(new Error('Analysis runtime failure')),
			close: vi.fn()
		};
		freshFactory.mockResolvedValueOnce(mockMi as never);

		const file = new File(['fake video data'], 'video.mp4', { type: 'video/mp4' });

		// Bug 7: parseVideo() has no try/catch around analyzeData
		// On unfixed code: rejects with "Analysis runtime failure"
		// On fixed code: resolves with empty result
		await expect(parseVideo(file, 'file-bug7-analyze')).resolves.toMatchObject({
			status: 'done',
			fileId: 'file-bug7-analyze',
			fieldCount: 0
		});
	});

	// Preservation: successful parse returns real scan result (EXPECTED OUTCOME: PASSES on unfixed code)
	it('parseVideo returns scan result with fields when MediaInfo succeeds', async () => {
		vi.resetModules();
		vi.mock('mediainfo.js', () => ({ default: vi.fn() }));

		const { parseVideo } = await import('../videoParser.js');
		const freshFactory = vi.mocked((await import('mediainfo.js')).default);

		const mockResult = {
			media: {
				track: [
					{
						'@type': 'General',
						Encoded_Application: 'Adobe Premiere',
						Encoded_Date: '2025-01-15T12:00:00Z'
					}
				]
			}
		};
		const mockMi = {
			analyzeData: vi.fn().mockResolvedValueOnce(mockResult),
			close: vi.fn()
		};
		freshFactory.mockResolvedValueOnce(mockMi as never);

		const file = new File(['mp4 data'], 'success.mp4', { type: 'video/mp4' });
		const result = await parseVideo(file, 'file-success');
		expect(result.status).toBe('done');
		expect(result.fileId).toBe('file-success');
		// Should have found Software field from Encoded_Application
		expect(result.fields.length).toBeGreaterThan(0);
	});
});
