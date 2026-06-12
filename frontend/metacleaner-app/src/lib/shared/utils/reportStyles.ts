export function tagStyle(tag: string): string {
	if (tag === 'GPS') return 'bg-brand-red/10 border-brand-red/20 text-brand-red';
	if (tag === 'EXIF') return 'bg-brand-orange/10 border-brand-orange/20 text-brand-orange';
	if (tag === 'XMP') return 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue';
	return 'bg-navy-lighter text-text-muted';
}

export function iconStyle(color: string): string {
	if (color === 'green') return 'bg-brand-green/10 border-brand-green/20 text-brand-green';
	if (color === 'orange') return 'bg-brand-orange/10 border-brand-orange/20 text-brand-orange';
	return 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue';
}
