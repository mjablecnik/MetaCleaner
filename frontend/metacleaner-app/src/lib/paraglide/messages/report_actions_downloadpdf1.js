/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Actions_Downloadpdf1Inputs */

const en_report_actions_downloadpdf1 = /** @type {(inputs: Report_Actions_Downloadpdf1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Download PDF report`)
};

const cs_report_actions_downloadpdf1 = /** @type {(inputs: Report_Actions_Downloadpdf1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stáhnout PDF report`)
};

/**
* | output |
* | --- |
* | "Download PDF report" |
*
* @param {Report_Actions_Downloadpdf1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_actions_downloadpdf1 = /** @type {((inputs?: Report_Actions_Downloadpdf1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Actions_Downloadpdf1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_actions_downloadpdf1(inputs)
	return cs_report_actions_downloadpdf1(inputs)
});
export { report_actions_downloadpdf1 as "report.actions.downloadPdf" }