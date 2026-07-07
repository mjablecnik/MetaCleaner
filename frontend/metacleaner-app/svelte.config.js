import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter({
			fallback: 'index.html'
		}),
		// Hash-mode CSP: SvelteKit automatically computes SHA-256 hashes for any inline scripts
		// it generates and adds them to <meta http-equiv="Content-Security-Policy"> in the built
		// HTML. Combined with removing 'unsafe-inline' from the nginx script-src, this lets the
		// browser enforce a strict CSP without a per-request nonce server.
		// NOTE: the nginx add_header CSP must also remove 'unsafe-inline' and add the same hashes
		// once a post-build script extracts them from the built HTML files.
		csp: {
			mode: 'hash',
			directives: {
				'script-src': ['self', "'wasm-unsafe-eval'"],
				'connect-src': ['self', 'https:', 'http:', 'wss:', 'ws:']
			}
		}
	}
};

export default config;
