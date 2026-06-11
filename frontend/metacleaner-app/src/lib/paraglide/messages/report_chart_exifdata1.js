/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Chart_Exifdata1Inputs */

const en_report_chart_exifdata1 = /** @type {(inputs: Report_Chart_Exifdata1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`EXIF Data`)
};

const cs_report_chart_exifdata1 = /** @type {(inputs: Report_Chart_Exifdata1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`EXIF Data`)
};

/**
* | output |
* | --- |
* | "EXIF Data" |
*
* @param {Report_Chart_Exifdata1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_chart_exifdata1 = /** @type {((inputs?: Report_Chart_Exifdata1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Chart_Exifdata1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_chart_exifdata1(inputs)
	return cs_report_chart_exifdata1(inputs)
});
export { report_chart_exifdata1 as "report.chart.exifData" }