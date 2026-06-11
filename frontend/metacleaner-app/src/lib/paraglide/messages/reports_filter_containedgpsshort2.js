/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Filter_Containedgpsshort2Inputs */

const en_reports_filter_containedgpsshort2 = /** @type {(inputs: Reports_Filter_Containedgpsshort2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GPS`)
};

const cs_reports_filter_containedgpsshort2 = /** @type {(inputs: Reports_Filter_Containedgpsshort2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GPS`)
};

/**
* | output |
* | --- |
* | "GPS" |
*
* @param {Reports_Filter_Containedgpsshort2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_filter_containedgpsshort2 = /** @type {((inputs?: Reports_Filter_Containedgpsshort2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Filter_Containedgpsshort2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_filter_containedgpsshort2(inputs)
	return cs_reports_filter_containedgpsshort2(inputs)
});
export { reports_filter_containedgpsshort2 as "reports.filter.containedGpsShort" }