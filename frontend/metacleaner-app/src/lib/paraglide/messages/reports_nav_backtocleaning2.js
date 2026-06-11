/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Nav_Backtocleaning2Inputs */

const en_reports_nav_backtocleaning2 = /** @type {(inputs: Reports_Nav_Backtocleaning2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Back to cleaning`)
};

const cs_reports_nav_backtocleaning2 = /** @type {(inputs: Reports_Nav_Backtocleaning2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zpět na čištění`)
};

/**
* | output |
* | --- |
* | "Back to cleaning" |
*
* @param {Reports_Nav_Backtocleaning2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_nav_backtocleaning2 = /** @type {((inputs?: Reports_Nav_Backtocleaning2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Nav_Backtocleaning2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_nav_backtocleaning2(inputs)
	return cs_reports_nav_backtocleaning2(inputs)
});
export { reports_nav_backtocleaning2 as "reports.nav.backToCleaning" }