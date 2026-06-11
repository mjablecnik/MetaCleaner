/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Files_Expandall1Inputs */

const en_report_files_expandall1 = /** @type {(inputs: Report_Files_Expandall1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Expand all`)
};

const cs_report_files_expandall1 = /** @type {(inputs: Report_Files_Expandall1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rozbalit vše`)
};

/**
* | output |
* | --- |
* | "Expand all" |
*
* @param {Report_Files_Expandall1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_files_expandall1 = /** @type {((inputs?: Report_Files_Expandall1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Files_Expandall1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_files_expandall1(inputs)
	return cs_report_files_expandall1(inputs)
});
export { report_files_expandall1 as "report.files.expandAll" }