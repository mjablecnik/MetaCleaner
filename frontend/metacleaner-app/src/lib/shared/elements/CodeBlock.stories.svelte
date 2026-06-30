<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CodeBlock from './CodeBlock.svelte';

	const { Story } = defineMeta({
		title: 'Elements/CodeBlock',
		component: CodeBlock,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Single Line (Shell)">
	<div class="w-full max-w-lg">
		<CodeBlock code="curl -X POST https://api.metacleaner.com/v1/clean -F file=@photo.jpg" />
	</div>
</Story>

<Story name="Multi-line JSON">
	<div class="w-full max-w-lg">
		<CodeBlock
			code={`{
  "planId": "pro",
  "status": "active",
  "creditsRemaining": 87,
  "renewalDate": "2026-07-30"
}`}
		/>
	</div>
</Story>

<Story name="Multi-line cURL">
	<div class="w-full max-w-lg">
		<CodeBlock
			code={`curl -X POST https://api.metacleaner.com/v1/clean \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@photo.jpg" \\
  -o cleaned_photo.jpg`}
		/>
	</div>
</Story>

<Story name="JavaScript">
	<div class="w-full max-w-lg">
		<CodeBlock
			code={`const ws = new WebSocket('wss://api.metacleaner.com/v1/ws');
ws.onopen = () => ws.send(JSON.stringify({ type: 'auth', token: 'YOUR_KEY' }));
ws.onmessage = (event) => console.log(JSON.parse(event.data));`}
		/>
	</div>
</Story>
