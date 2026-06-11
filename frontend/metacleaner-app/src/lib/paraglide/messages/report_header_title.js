/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Header_TitleInputs */

const en_report_header_title = /** @type {(inputs: Report_Header_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Detailed cleaning report`)
};

const cs_report_header_title = /** @type {(inputs: Report_Header_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Detailní report čištění`)
};

/**
* | output |
* | --- |
* | "Detailed cleaning report" |
*
* @param {Report_Header_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_header_title = /** @type {((inputs?: Report_Header_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Header_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_header_title(inputs)
	return cs_report_header_title(inputs)
});
export { report_header_title as "report.header.title" }