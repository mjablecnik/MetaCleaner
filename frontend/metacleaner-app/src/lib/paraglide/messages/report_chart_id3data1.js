/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Chart_Id3data1Inputs */

const en_report_chart_id3data1 = /** @type {(inputs: Report_Chart_Id3data1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ID3 Tags`)
};

const cs_report_chart_id3data1 = /** @type {(inputs: Report_Chart_Id3data1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ID3 Tagy`)
};

/**
* | output |
* | --- |
* | "ID3 Tags" |
*
* @param {Report_Chart_Id3data1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_chart_id3data1 = /** @type {((inputs?: Report_Chart_Id3data1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Chart_Id3data1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_chart_id3data1(inputs)
	return cs_report_chart_id3data1(inputs)
});
export { report_chart_id3data1 as "report.chart.id3Data" }