<script lang="ts">
	import CopyButton from './CopyButton.svelte';

	interface Props {
		code: string;
		class?: string;
	}

	const { code, class: extraClass = '' }: Props = $props();

	/**
	 * Simple syntax highlighter for JSON and cURL/shell snippets.
	 * Uses brand colors from the app theme for consistency.
	 * - Keys (JSON): brand-blue
	 * - Strings: brand-green
	 * - Numbers/booleans/null: brand-orange
	 * - Comments/flags: text-muted
	 * - URLs: brand-green
	 * - curl command: brand-blue
	 */
	function highlightCode(source: string): string {
		// Detect if this is JSON
		const trimmed = source.trim();
		if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
			return highlightJson(source);
		}
		// Detect shell/cURL
		if (trimmed.startsWith('curl') || trimmed.startsWith('const ') || trimmed.startsWith('ws.')) {
			return highlightShell(source);
		}
		// Detect HTTP headers (Key: Value format)
		if (/^[A-Z][a-zA-Z-]+:/.test(trimmed)) {
			return highlightHeaders(source);
		}
		return escapeHtml(source);
	}

	function escapeHtml(str: string): string {
		return str
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}

	function highlightJson(source: string): string {
		// Process line by line to maintain structure
		return source
			.split('\n')
			.map((line) => {
				let result = escapeHtml(line);
				// Highlight JSON keys: "key":
				result = result.replace(
					/(&quot;|")([\w_]+)(&quot;|")(\s*:)/g,
					'<span class="text-brand-blue">"$2"</span>$4'
				);
				// Highlight string values: "value" (after a colon or in arrays)
				result = result.replace(
					/:\s*(&quot;|")((?:[^"\\]|\\.)*)(&quot;|")/g,
					': <span class="text-brand-green">"$2"</span>'
				);
				// Highlight string values in arrays
				result = result.replace(
					/(?<=[\[,]\s*)(&quot;|")((?:[^"\\]|\\.)*)(&quot;|")/g,
					'<span class="text-brand-green">"$2"</span>'
				);
				// Highlight numbers
				result = result.replace(
					/:\s*(\d+\.?\d*)/g,
					': <span class="text-brand-green">$1</span>'
				);
				// Highlight booleans and null
				result = result.replace(
					/:\s*(true|false|null)\b/g,
					': <span class="text-brand-orange">$1</span>'
				);
				// Highlight punctuation (braces, brackets, commas, colons) in gray
				result = result.replace(
					/(?<!["\w<\/-])([{}[\],:])/g,
					'<span class="text-text-muted">$1</span>'
				);
				return result;
			})
			.join('\n');
	}

	function highlightShell(source: string): string {
		return source
			.split('\n')
			.map((line) => {
				let result = escapeHtml(line);
				// Highlight quoted strings first (before other rules inject HTML)
				result = result.replace(
					/"([^"]*?)"/g,
					'<span class="text-brand-orange">"$1"</span>'
				);
				// Highlight curl command
				result = result.replace(/^(curl)\b/, '<span class="text-brand-blue">$1</span>');
				// Highlight flags: -X, -H, -F, -d, -o (only flags not inside quotes/spans)
				result = result.replace(
					/(\s)(-[A-Za-z])\b(?=[^<]*(?:<span|$))/g,
					'$1<span class="text-text-muted">$2</span>'
				);
				// Highlight URLs (https://...) not already inside a span
				result = result.replace(
					/(?<!">)(https?:\/\/[^\s\\&<]+)/g,
					'<span class="text-brand-green">$1</span>'
				);
				// Highlight wss:// URLs not already inside a span
				result = result.replace(
					/(?<!">)(wss?:\/\/[^\s\\&<]+)/g,
					'<span class="text-brand-green">$1</span>'
				);
				// Highlight JS keywords (const, new)
				result = result.replace(
					/\b(const|new|function)\b(?=[^<]*(?:<|$))/g,
					'<span class="text-brand-blue">$1</span>'
				);
				// Highlight JS method/property assignments (.onmessage =)
				result = result.replace(
					/(\.\w+)\s*=/g,
					'<span class="text-brand-blue">$1</span> ='
				);
				return result;
			})
			.join('\n');
	}

	function highlightHeaders(source: string): string {
		return source
			.split('\n')
			.map((line) => {
				let result = escapeHtml(line);
				// Header name: value
				result = result.replace(
					/^([A-Za-z][A-Za-z0-9-]*)(:)\s*(.*)/,
					'<span class="text-brand-blue">$1</span>$2 <span class="text-brand-green">$3</span>'
				);
				return result;
			})
			.join('\n');
	}

	const highlighted = $derived(highlightCode(code));
</script>

<div class="relative rounded-lg border border-navy-lighter {extraClass}" style="background:#080f1e">
	<div class="absolute top-2 right-2 z-10">
		<CopyButton text={code} />
	</div>
	<pre
		class="overflow-x-auto p-4 pr-10 font-mono text-sm leading-relaxed whitespace-pre text-white">{@html highlighted}</pre>
</div>
