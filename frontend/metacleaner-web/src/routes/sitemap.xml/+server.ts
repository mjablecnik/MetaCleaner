export const prerender = true;

const SITE = 'https://metacleaner.app';
const paths = ['', '/features', '/pricing', '/about', '/terms', '/privacy'];

export function GET() {
	const urls = paths
		.map((p) => {
			const enUrl = `${SITE}${p}`;
			const csUrl = `${SITE}/cs${p}`;
			return [
				`<url>`,
				`<loc>${enUrl}</loc>`,
				`<xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>`,
				`<xhtml:link rel="alternate" hreflang="cs" href="${csUrl}"/>`,
				`<xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}"/>`,
				`</url>`,
				`<url>`,
				`<loc>${csUrl}</loc>`,
				`<xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>`,
				`<xhtml:link rel="alternate" hreflang="cs" href="${csUrl}"/>`,
				`<xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}"/>`,
				`</url>`
			].join('');
		})
		.join('');
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`,
		{ headers: { 'Content-Type': 'application/xml' } }
	);
}
