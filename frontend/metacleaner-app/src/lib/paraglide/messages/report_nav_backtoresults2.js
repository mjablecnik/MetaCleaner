/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Nav_Backtoresults2Inputs */

const en_report_nav_backtoresults2 = /** @type {(inputs: Report_Nav_Backtoresults2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Back to results`)
};

const cs_report_nav_backtoresults2 = /** @type {(inputs: Report_Nav_Backtoresults2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zpět na výsledky`)
};

/**
* | output |
* | --- |
* | "Back to results" |
*
* @param {Report_Nav_Backtoresults2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_nav_backtoresults2 = /** @type {((inputs?: Report_Nav_Backtoresults2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Nav_Backtoresults2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_nav_backtoresults2(inputs)
	return cs_report_nav_backtoresults2(inputs)
});
export { report_nav_backtoresults2 as "report.nav.backToResults" }