/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Search_PlaceholderInputs */

const en_reports_search_placeholder = /** @type {(inputs: Reports_Search_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search report...`)
};

const cs_reports_search_placeholder = /** @type {(inputs: Reports_Search_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hledat report...`)
};

/**
* | output |
* | --- |
* | "Search report..." |
*
* @param {Reports_Search_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_search_placeholder = /** @type {((inputs?: Reports_Search_PlaceholderInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Search_PlaceholderInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_search_placeholder(inputs)
	return cs_reports_search_placeholder(inputs)
});
export { reports_search_placeholder as "reports.search.placeholder" }