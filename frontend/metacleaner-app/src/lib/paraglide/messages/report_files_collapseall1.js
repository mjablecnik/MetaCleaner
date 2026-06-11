/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Files_Collapseall1Inputs */

const en_report_files_collapseall1 = /** @type {(inputs: Report_Files_Collapseall1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Collapse all`)
};

const cs_report_files_collapseall1 = /** @type {(inputs: Report_Files_Collapseall1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sbalit vše`)
};

/**
* | output |
* | --- |
* | "Collapse all" |
*
* @param {Report_Files_Collapseall1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_files_collapseall1 = /** @type {((inputs?: Report_Files_Collapseall1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Files_Collapseall1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_files_collapseall1(inputs)
	return cs_report_files_collapseall1(inputs)
});
export { report_files_collapseall1 as "report.files.collapseAll" }