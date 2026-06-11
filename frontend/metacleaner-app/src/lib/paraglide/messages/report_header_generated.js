/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Header_GeneratedInputs */

const en_report_header_generated = /** @type {(inputs: Report_Header_GeneratedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generated:`)
};

const cs_report_header_generated = /** @type {(inputs: Report_Header_GeneratedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vygenerováno:`)
};

/**
* | output |
* | --- |
* | "Generated:" |
*
* @param {Report_Header_GeneratedInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_header_generated = /** @type {((inputs?: Report_Header_GeneratedInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Header_GeneratedInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_header_generated(inputs)
	return cs_report_header_generated(inputs)
});
export { report_header_generated as "report.header.generated" }