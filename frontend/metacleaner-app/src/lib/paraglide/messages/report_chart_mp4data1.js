/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Chart_Mp4data1Inputs */

const en_report_chart_mp4data1 = /** @type {(inputs: Report_Chart_Mp4data1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MP4 Atoms`)
};

const cs_report_chart_mp4data1 = /** @type {(inputs: Report_Chart_Mp4data1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MP4 Atomy`)
};

/**
* | output |
* | --- |
* | "MP4 Atoms" |
*
* @param {Report_Chart_Mp4data1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_chart_mp4data1 = /** @type {((inputs?: Report_Chart_Mp4data1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Chart_Mp4data1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_chart_mp4data1(inputs)
	return cs_report_chart_mp4data1(inputs)
});
export { report_chart_mp4data1 as "report.chart.mp4Data" }