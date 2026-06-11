/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Filter_AllInputs */

const en_reports_filter_all = /** @type {(inputs: Reports_Filter_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`All`)
};

const cs_reports_filter_all = /** @type {(inputs: Reports_Filter_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vše`)
};

/**
* | output |
* | --- |
* | "All" |
*
* @param {Reports_Filter_AllInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_filter_all = /** @type {((inputs?: Reports_Filter_AllInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Filter_AllInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_filter_all(inputs)
	return cs_reports_filter_all(inputs)
});
export { reports_filter_all as "reports.filter.all" }