/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Chart_Gpsdata1Inputs */

const en_report_chart_gpsdata1 = /** @type {(inputs: Report_Chart_Gpsdata1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GPS Data`)
};

const cs_report_chart_gpsdata1 = /** @type {(inputs: Report_Chart_Gpsdata1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GPS Data`)
};

/**
* | output |
* | --- |
* | "GPS Data" |
*
* @param {Report_Chart_Gpsdata1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_chart_gpsdata1 = /** @type {((inputs?: Report_Chart_Gpsdata1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Chart_Gpsdata1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_chart_gpsdata1(inputs)
	return cs_report_chart_gpsdata1(inputs)
});
export { report_chart_gpsdata1 as "report.chart.gpsData" }