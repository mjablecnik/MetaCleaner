import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MetadataOverview from '../MetadataOverview.svelte';

const sampleBreakdown = {
	gpsLocations: 2,
	exifFields: 18,
	xmpFields: 5,
	id3mp4Fields: 0,
	otherFields: 3
};

describe('MetadataOverview', () => {
	it('renders without errors', async () => {
		const { container } = render(MetadataOverview, {
			beforeBreakdown: sampleBreakdown,
			totalFieldsBefore: 28,
			gpsLocationsRemoved: 2
		});
		expect(container.querySelector('div')).not.toBeNull();
	});

	it('desktop layout has lg:flex class (hidden on mobile)', async () => {
		const { container } = render(MetadataOverview, {
			beforeBreakdown: sampleBreakdown,
			totalFieldsBefore: 28,
			gpsLocationsRemoved: 2
		});
		// Desktop two-column card uses hidden + lg:flex classes
		const desktopCard = container.querySelector('.lg\\:flex');
		expect(desktopCard).not.toBeNull();
	});

	it('mobile layout has lg:hidden class', async () => {
		const { container } = render(MetadataOverview, {
			beforeBreakdown: sampleBreakdown,
			totalFieldsBefore: 28,
			gpsLocationsRemoved: 2
		});
		const mobileAccordion = container.querySelector('.lg\\:hidden');
		expect(mobileAccordion).not.toBeNull();
	});

	it('shows tab buttons in mobile accordion', async () => {
		render(MetadataOverview, {
			beforeBreakdown: sampleBreakdown,
			totalFieldsBefore: 28,
			gpsLocationsRemoved: 2
		});
		// Both "Před čištěním" and "Po čištění" tab buttons should be present
		const buttons = page.getByRole('button');
		await expect.element(buttons.first()).toBeInTheDocument();
	});

	it('shows GPS count in before section', async () => {
		render(MetadataOverview, {
			beforeBreakdown: sampleBreakdown,
			totalFieldsBefore: 28,
			gpsLocationsRemoved: 2
		});
		// GPS count (2) appears in the before column
		await expect.element(page.getByText('2').first()).toBeInTheDocument();
	});

	it('shows EXIF field count', async () => {
		render(MetadataOverview, {
			beforeBreakdown: sampleBreakdown,
			totalFieldsBefore: 28,
			gpsLocationsRemoved: 2
		});
		// EXIF count (18) should be visible
		await expect.element(page.getByText('18').first()).toBeInTheDocument();
	});
});
