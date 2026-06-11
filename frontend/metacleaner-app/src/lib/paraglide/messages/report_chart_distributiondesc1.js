/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Chart_Distributiondesc1Inputs */

const en_report_chart_distributiondesc1 = /** @type {(inputs: Report_Chart_Distributiondesc1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`By metadata type across all files`)
};

const cs_report_chart_distributiondesc1 = /** @type {(inputs: Report_Chart_Distributiondesc1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Podle typu metadat napříč všemi soubory`)
};

/**
* | output |
* | --- |
* | "By metadata type across all files" |
*
* @param {Report_Chart_Distributiondesc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_chart_distributiondesc1 = /** @type {((inputs?: Report_Chart_Distributiondesc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Chart_Distributiondesc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_chart_distributiondesc1(inputs)
	return cs_report_chart_distributiondesc1(inputs)
});
export { report_chart_distributiondesc1 as "report.chart.distributionDesc" }