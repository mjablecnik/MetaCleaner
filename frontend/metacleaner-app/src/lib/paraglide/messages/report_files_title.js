/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Files_TitleInputs */

const en_report_files_title = /** @type {(inputs: Report_Files_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Detailed file overview`)
};

const cs_report_files_title = /** @type {(inputs: Report_Files_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Detailní přehled souborů`)
};

/**
* | output |
* | --- |
* | "Detailed file overview" |
*
* @param {Report_Files_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_files_title = /** @type {((inputs?: Report_Files_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Files_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_files_title(inputs)
	return cs_report_files_title(inputs)
});
export { report_files_title as "report.files.title" }