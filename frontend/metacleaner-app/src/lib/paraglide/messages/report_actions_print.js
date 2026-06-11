/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Actions_PrintInputs */

const en_report_actions_print = /** @type {(inputs: Report_Actions_PrintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Print`)
};

const cs_report_actions_print = /** @type {(inputs: Report_Actions_PrintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tisknout`)
};

/**
* | output |
* | --- |
* | "Print" |
*
* @param {Report_Actions_PrintInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_actions_print = /** @type {((inputs?: Report_Actions_PrintInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Actions_PrintInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_actions_print(inputs)
	return cs_report_actions_print(inputs)
});
export { report_actions_print as "report.actions.print" }