/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Filter_PhotosInputs */

const en_reports_filter_photos = /** @type {(inputs: Reports_Filter_PhotosInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Photos`)
};

const cs_reports_filter_photos = /** @type {(inputs: Reports_Filter_PhotosInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fotografie`)
};

/**
* | output |
* | --- |
* | "Photos" |
*
* @param {Reports_Filter_PhotosInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_filter_photos = /** @type {((inputs?: Reports_Filter_PhotosInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Filter_PhotosInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_filter_photos(inputs)
	return cs_reports_filter_photos(inputs)
});
export { reports_filter_photos as "reports.filter.photos" }