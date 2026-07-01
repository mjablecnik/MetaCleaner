const {
	mockGetServiceConfigs,
	mockGetUsers,
	mockMapToUserStats,
	mockMapToUsers
} = vi.hoisted(() => ({
	mockGetServiceConfigs: vi.fn(),
	mockGetUsers: vi.fn(),
	mockMapToUserStats: vi.fn(),
	mockMapToUsers: vi.fn()
}));

vi.mock('$lib/server/config.js', () => ({
	getServiceConfigs: mockGetServiceConfigs
}));

vi.mock('$lib/server/clients/supabaseClient.js', () => ({
	getUsers: mockGetUsers
}));

vi.mock('$lib/server/mappers/supabaseMapper.js', () => ({
	mapToUserStats: mockMapToUserStats,
	mapToUsers: mockMapToUsers
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from '../+page.server.js';

const SUPABASE_CONFIG = { url: 'https://db.supabase.co', serviceKey: 'key', timeout: 10_000 };

const BASE_CONFIG = {
	fly: { configured: false as const, missingVars: ['FLY_API_TOKEN'] },
	cloudflare: { configured: false as const, missingVars: ['CLOUDFLARE_API_TOKEN'] },
	stripe: { configured: false as const, missingVars: ['STRIPE_SECRET_KEY'] },
	supabase: { configured: false as const, missingVars: ['SUPABASE_URL'] },
	sentry: { configured: false as const, missingVars: ['SENTRY_AUTH_TOKEN'] }
};

const CONFIGURED_CONFIG = {
	...BASE_CONFIG,
	supabase: { configured: true as const, config: SUPABASE_CONFIG }
};

const FAKE_USER_LIST = [{ id: 'u1', email: 'a@b.com', created_at: '2024-01-01' }];
const FAKE_USERS_RESPONSE = { users: FAKE_USER_LIST, total: 1 };
const FAKE_USER_STATS = [{ key: 'totalUsers', value: '1' }];
const FAKE_MAPPED_USERS = [{ id: 'u1', email: 'a@b.com' }];

function makeEvent() {
	return { depends: vi.fn(), setHeaders: vi.fn() };
}

beforeEach(() => {
	mockGetServiceConfigs.mockReturnValue(BASE_CONFIG);
	mockGetUsers.mockResolvedValue(FAKE_USERS_RESPONSE);
	mockMapToUserStats.mockReturnValue(FAKE_USER_STATS);
	mockMapToUsers.mockReturnValue(FAKE_MAPPED_USERS);
});

describe('uzivatele load — not configured (Supabase missing)', () => {
	it('throws when Supabase is not configured', async () => {
		await expect(load(makeEvent() as never)).rejects.toThrow(
			'Supabase is required but not configured'
		);
	});

	it('does not call Supabase client when unconfigured', async () => {
		try {
			await load(makeEvent() as never);
		} catch {
			// expected throw
		}
		expect(mockGetUsers).not.toHaveBeenCalled();
	});
});

describe('uzivatele load — success path', () => {
	beforeEach(() => {
		mockGetServiceConfigs.mockReturnValue(CONFIGURED_CONFIG);
	});

	it('returns stats as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.stats.status).toBe('ok');
		if (result.stats.status !== 'ok') return;
		expect(result.stats.data).toEqual(FAKE_USER_STATS);
	});

	it('returns users as ok with mapper output', async () => {
		const result = await load(makeEvent() as never);
		expect(result.users.status).toBe('ok');
		if (result.users.status !== 'ok') return;
		expect(result.users.data).toEqual(FAKE_MAPPED_USERS);
	});

	it('calls depends("app:uzivatele") and sets no-store header', async () => {
		const event = makeEvent();
		await load(event as never);
		expect(event.depends).toHaveBeenCalledWith('app:uzivatele');
		expect(event.setHeaders).toHaveBeenCalledWith({ 'Cache-Control': 'no-store' });
	});

	it('calls getUsers with supabase config, page 1, and limit 100', async () => {
		await load(makeEvent() as never);
		expect(mockGetUsers).toHaveBeenCalledWith(SUPABASE_CONFIG, 1, 100);
	});

	it('delegates to mapToUserStats with users array and total', async () => {
		await load(makeEvent() as never);
		expect(mockMapToUserStats).toHaveBeenCalledWith(FAKE_USER_LIST, 1);
	});

	it('delegates to mapToUsers with users array', async () => {
		await load(makeEvent() as never);
		expect(mockMapToUsers).toHaveBeenCalledWith(FAKE_USER_LIST);
	});
});

describe('uzivatele load — getUsers rejection', () => {
	beforeEach(() => {
		mockGetServiceConfigs.mockReturnValue(CONFIGURED_CONFIG);
		mockGetUsers.mockRejectedValue(new Error('Supabase unreachable'));
	});

	it('returns stats as error when getUsers rejects', async () => {
		const result = await load(makeEvent() as never);
		expect(result.stats.status).toBe('error');
	});

	it('returns users as error when getUsers rejects', async () => {
		const result = await load(makeEvent() as never);
		expect(result.users.status).toBe('error');
	});
});
