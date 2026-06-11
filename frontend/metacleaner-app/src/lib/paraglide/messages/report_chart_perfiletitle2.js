/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Chart_Perfiletitle2Inputs */

const en_report_chart_perfiletitle2 = /** @type {(inputs: Report_Chart_Perfiletitle2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fields removed per file`)
};

const cs_report_chart_perfiletitle2 = /** @type {(inputs: Report_Chart_Perfiletitle2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pole odstraněna dle souboru`)
};

/**
* | output |
* | --- |
* | "Fields removed per file" |
*
* @param {Report_Chart_Perfiletitle2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_chart_perfiletitle2 = /** @type {((inputs?: Report_Chart_Perfiletitle2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Chart_Perfiletitle2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_chart_perfiletitle2(inputs)
	return cs_report_chart_perfiletitle2(inputs)
});
export { report_chart_perfiletitle2 as "report.chart.perFileTitle" }