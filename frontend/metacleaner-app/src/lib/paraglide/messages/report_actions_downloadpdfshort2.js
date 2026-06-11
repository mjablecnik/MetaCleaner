/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Actions_Downloadpdfshort2Inputs */

const en_report_actions_downloadpdfshort2 = /** @type {(inputs: Report_Actions_Downloadpdfshort2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Download PDF`)
};

const cs_report_actions_downloadpdfshort2 = /** @type {(inputs: Report_Actions_Downloadpdfshort2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stáhnout PDF`)
};

/**
* | output |
* | --- |
* | "Download PDF" |
*
* @param {Report_Actions_Downloadpdfshort2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_actions_downloadpdfshort2 = /** @type {((inputs?: Report_Actions_Downloadpdfshort2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Actions_Downloadpdfshort2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_actions_downloadpdfshort2(inputs)
	return cs_report_actions_downloadpdfshort2(inputs)
});
export { report_actions_downloadpdfshort2 as "report.actions.downloadPdfShort" }