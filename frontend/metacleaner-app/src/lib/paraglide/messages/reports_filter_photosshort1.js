/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Filter_Photosshort1Inputs */

const en_reports_filter_photosshort1 = /** @type {(inputs: Reports_Filter_Photosshort1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Photos`)
};

const cs_reports_filter_photosshort1 = /** @type {(inputs: Reports_Filter_Photosshort1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Foto`)
};

/**
* | output |
* | --- |
* | "Photos" |
*
* @param {Reports_Filter_Photosshort1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_filter_photosshort1 = /** @type {((inputs?: Reports_Filter_Photosshort1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Filter_Photosshort1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_filter_photosshort1(inputs)
	return cs_reports_filter_photosshort1(inputs)
});
export { reports_filter_photosshort1 as "reports.filter.photosShort" }