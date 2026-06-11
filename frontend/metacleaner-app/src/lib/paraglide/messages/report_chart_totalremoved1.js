/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Chart_Totalremoved1Inputs */

const en_report_chart_totalremoved1 = /** @type {(inputs: Report_Chart_Totalremoved1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Total removed`)
};

const cs_report_chart_totalremoved1 = /** @type {(inputs: Report_Chart_Totalremoved1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Celkem odstraněno`)
};

/**
* | output |
* | --- |
* | "Total removed" |
*
* @param {Report_Chart_Totalremoved1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_chart_totalremoved1 = /** @type {((inputs?: Report_Chart_Totalremoved1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Chart_Totalremoved1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_chart_totalremoved1(inputs)
	return cs_report_chart_totalremoved1(inputs)
});
export { report_chart_totalremoved1 as "report.chart.totalRemoved" }