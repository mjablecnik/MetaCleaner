/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Chart_Distributiontitle1Inputs */

const en_report_chart_distributiontitle1 = /** @type {(inputs: Report_Chart_Distributiontitle1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Distribution of removed metadata`)
};

const cs_report_chart_distributiontitle1 = /** @type {(inputs: Report_Chart_Distributiontitle1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rozložení odstraněných metadat`)
};

/**
* | output |
* | --- |
* | "Distribution of removed metadata" |
*
* @param {Report_Chart_Distributiontitle1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_chart_distributiontitle1 = /** @type {((inputs?: Report_Chart_Distributiontitle1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Chart_Distributiontitle1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_chart_distributiontitle1(inputs)
	return cs_report_chart_distributiontitle1(inputs)
});
export { report_chart_distributiontitle1 as "report.chart.distributionTitle" }