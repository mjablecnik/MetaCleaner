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
		// Detect shell/cURL/JavaScript
		if (
			trimmed.startsWith('curl') ||
			trimmed.startsWith('const ') ||
			trimmed.startsWith('let ') ||
			trimmed.startsWith('var ') ||
			trimmed.startsWith('ws.') ||
			trimmed.startsWith('function ') ||
			trimmed.startsWith('import ') ||
			trimmed.startsWith('export ')
		) {
			return highlightShell(source);
		}
		// Detect HTTP headers (Key: Value format)
		if (/^[A-Z][a-zA-Z-]+:/.test(trimmed)) {
			return highlightHeaders(source);
		}
		return escapeHtml(source);
	}

	function escapeHtml(str: string): string {
		return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
					/(?<=[[,]\s*)(&quot;|")((?:[^"\\]|\\.)*)(&quot;|")/g,
					'<span class="text-brand-green">"$2"</span>'
				);
				// Highlight numbers
				result = result.replace(/:\s*(\d+\.?\d*)/g, ': <span class="text-brand-green">$1</span>');
				// Highlight booleans and null
				result = result.replace(
					/:\s*(true|false|null)\b/g,
					': <span class="text-brand-orange">$1</span>'
				);
				// Highlight punctuation (braces, brackets, commas, colons) in gray
				result = result.replace(
					/(?<!["\w</-])([{}[\],:])/g,
					'<span class="text-text-muted">$1</span>'
				);
				return result;
			})
			.join('\n');
	}

	function highlightShell(source: string): string {
		const trimmed = source.trim();
		// If it looks like JavaScript (const, let, var, ws., function), use JS highlighter
		if (
			trimmed.startsWith('const ') ||
			trimmed.startsWith('let ') ||
			trimmed.startsWith('var ') ||
			trimmed.startsWith('ws.') ||
			trimmed.startsWith('function ')
		) {
			return highlightJavaScript(source);
		}
		return highlightCurl(source);
	}

	function highlightCurl(source: string): string {
		return source
			.split('\n')
			.map((line) => {
				let result = escapeHtml(line);
				// Highlight quoted strings first (before other rules inject HTML)
				result = result.replace(/"([^"]*?)"/g, '<span class="text-brand-orange">"$1"</span>');
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
				return result;
			})
			.join('\n');
	}

	/**
	 * Token-based JavaScript syntax highlighter.
	 * Produces richer coloring for JS code blocks:
	 * - Keywords (const, new, switch, case, break, etc.): brand-blue
	 * - Strings ('...', "...", `...`): brand-green
	 * - Template literal interpolations ${...}: brand-orange inside green string
	 * - Numbers: brand-orange
	 * - Comments (// ...): text-muted italic
	 * - Built-in objects (console, JSON, WebSocket): purple/violet
	 * - Method calls (.log, .parse, .close): brand-orange
	 * - Arrow functions (=>): brand-blue
	 * - Property access (.onopen, .onmessage, etc.): brand-blue
	 */
	function highlightJavaScript(source: string): string {
		const keywords = new Set([
			'const',
			'let',
			'var',
			'new',
			'function',
			'return',
			'if',
			'else',
			'switch',
			'case',
			'break',
			'default',
			'throw',
			'try',
			'catch',
			'finally',
			'typeof',
			'instanceof',
			'void',
			'delete',
			'import',
			'export',
			'from',
			'class',
			'extends',
			'async',
			'await'
		]);

		const builtins = new Set([
			'console',
			'JSON',
			'WebSocket',
			'Math',
			'Date',
			'Promise',
			'Array',
			'Object',
			'String',
			'Number',
			'Boolean',
			'Error',
			'Map',
			'Set',
			'window',
			'document'
		]);

		const constants = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity']);

		type Token = {
			type:
				| 'keyword'
				| 'builtin'
				| 'constant'
				| 'string'
				| 'template'
				| 'number'
				| 'comment'
				| 'method'
				| 'property'
				| 'arrow'
				| 'punctuation'
				| 'text';
			value: string;
		};

		function tokenize(code: string): Token[] {
			const tokens: Token[] = [];
			let i = 0;

			while (i < code.length) {
				// Single-line comment
				if (code[i] === '/' && code[i + 1] === '/') {
					let end = code.indexOf('\n', i);
					if (end === -1) end = code.length;
					tokens.push({ type: 'comment', value: code.slice(i, end) });
					i = end;
					continue;
				}

				// Template literal
				if (code[i] === '`') {
					let j = i + 1;
					let templateStr = '`';
					while (j < code.length && code[j] !== '`') {
						if (code[j] === '\\') {
							templateStr += code[j] + (code[j + 1] || '');
							j += 2;
						} else if (code[j] === '$' && code[j + 1] === '{') {
							// End current template part, tokenize interpolation
							templateStr += '${';
							j += 2;
							let braceDepth = 1;
							while (j < code.length && braceDepth > 0) {
								if (code[j] === '{') braceDepth++;
								else if (code[j] === '}') braceDepth--;
								if (braceDepth > 0) {
									templateStr += code[j];
									j++;
								}
							}
							templateStr += '}';
							j++; // skip closing }
						} else {
							templateStr += code[j];
							j++;
						}
					}
					templateStr += '`';
					j++; // skip closing `
					tokens.push({ type: 'template', value: templateStr });
					i = j;
					continue;
				}

				// Single/double quoted strings
				if (code[i] === "'" || code[i] === '"') {
					const quote = code[i];
					let j = i + 1;
					while (j < code.length && code[j] !== quote) {
						if (code[j] === '\\') j++;
						j++;
					}
					j++; // skip closing quote
					tokens.push({ type: 'string', value: code.slice(i, j) });
					i = j;
					continue;
				}

				// Numbers
				if (/\d/.test(code[i]) && (i === 0 || /[\s=:(,+\-*/[]/.test(code[i - 1]))) {
					let j = i;
					while (j < code.length && /[\d.]/.test(code[j])) j++;
					tokens.push({ type: 'number', value: code.slice(i, j) });
					i = j;
					continue;
				}

				// Arrow function
				if (code[i] === '=' && code[i + 1] === '>') {
					tokens.push({ type: 'arrow', value: '=>' });
					i += 2;
					continue;
				}

				// Dot followed by identifier (method call or property)
				if (code[i] === '.' && /[a-zA-Z_]/.test(code[i + 1] || '')) {
					let j = i + 1;
					while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++;
					const name = code.slice(i + 1, j);
					// Check if followed by ( → method call, or = → property assignment
					const afterName = code.slice(j).trimStart();
					if (afterName.startsWith('(')) {
						tokens.push({ type: 'method', value: '.' + name });
					} else {
						tokens.push({ type: 'property', value: '.' + name });
					}
					i = j;
					continue;
				}

				// Identifiers and keywords
				if (/[a-zA-Z_$]/.test(code[i])) {
					let j = i;
					while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++;
					const word = code.slice(i, j);
					if (keywords.has(word)) {
						tokens.push({ type: 'keyword', value: word });
					} else if (builtins.has(word)) {
						tokens.push({ type: 'builtin', value: word });
					} else if (constants.has(word)) {
						tokens.push({ type: 'constant', value: word });
					} else {
						tokens.push({ type: 'text', value: word });
					}
					i = j;
					continue;
				}

				// Punctuation
				if (/[{}[\]();,:]/.test(code[i])) {
					tokens.push({ type: 'punctuation', value: code[i] });
					i++;
					continue;
				}

				// Anything else (whitespace, operators)
				tokens.push({ type: 'text', value: code[i] });
				i++;
			}
			return tokens;
		}

		function renderToken(token: Token): string {
			const val = escapeHtml(token.value);
			switch (token.type) {
				case 'keyword':
					return `<span class="text-purple-400">${val}</span>`;
				case 'builtin':
					return `<span class="text-cyan-300">${val}</span>`;
				case 'constant':
					return `<span class="text-brand-orange">${val}</span>`;
				case 'string':
					return `<span class="text-brand-green">${val}</span>`;
				case 'template':
					return renderTemplateLiteral(token.value);
				case 'number':
					return `<span class="text-brand-orange">${val}</span>`;
				case 'comment':
					return `<span class="text-text-muted italic">${val}</span>`;
				case 'method':
					return `<span class="text-cyan-300">${val}</span>`;
				case 'property':
					return `<span class="text-sky-300">${val}</span>`;
				case 'arrow':
					return `<span class="text-purple-400">${val}</span>`;
				case 'punctuation':
					return `<span class="text-text-muted">${val}</span>`;
				default:
					return `<span class="text-blue-400">${val}</span>`;
			}
		}

		function renderTemplateLiteral(raw: string): string {
			// Parse template literal and highlight interpolations differently
			let result = '';
			let i = 0;
			// Opening backtick
			result += '<span class="text-brand-green">`';
			i++; // skip `

			while (i < raw.length - 1) {
				// -1 to skip closing backtick
				if (raw[i] === '\\') {
					result += escapeHtml(raw[i] + (raw[i + 1] || ''));
					i += 2;
				} else if (raw[i] === '$' && raw[i + 1] === '{') {
					// Close green span, open interpolation
					result += '</span><span class="text-brand-orange">${</span>';
					i += 2;
					// Collect interpolation content
					let braceDepth = 1;
					let interpContent = '';
					while (i < raw.length && braceDepth > 0) {
						if (raw[i] === '{') braceDepth++;
						else if (raw[i] === '}') {
							braceDepth--;
							if (braceDepth === 0) break;
						}
						interpContent += raw[i];
						i++;
					}
					// Render interpolation content with its own highlighting
					result += `<span class="text-orange-300">${escapeHtml(interpContent)}</span>`;
					result += '<span class="text-brand-orange">}</span>';
					i++; // skip closing }
					// Reopen green span for rest of template
					result += '<span class="text-brand-green">';
				} else {
					result += escapeHtml(raw[i]);
					i++;
				}
			}
			// Closing backtick
			result += '`</span>';
			return result;
		}

		const tokens = tokenize(source);
		return tokens.map(renderToken).join('');
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
	<!-- eslint-disable svelte/no-at-html-tags -->
	<pre
		class="overflow-x-auto p-4 pr-10 font-mono text-sm leading-relaxed whitespace-pre text-white">{@html highlighted}</pre>
	<!-- eslint-enable svelte/no-at-html-tags -->
</div>
