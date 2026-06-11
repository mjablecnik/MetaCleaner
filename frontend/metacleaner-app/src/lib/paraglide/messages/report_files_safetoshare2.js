/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Files_Safetoshare2Inputs */

const en_report_files_safetoshare2 = /** @type {(inputs: Report_Files_Safetoshare2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`File is safe to share.`)
};

const cs_report_files_safetoshare2 = /** @type {(inputs: Report_Files_Safetoshare2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Soubor je bezpečný ke sdílení.`)
};

/**
* | output |
* | --- |
* | "File is safe to share." |
*
* @param {Report_Files_Safetoshare2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_files_safetoshare2 = /** @type {((inputs?: Report_Files_Safetoshare2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Files_Safetoshare2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_files_safetoshare2(inputs)
	return cs_report_files_safetoshare2(inputs)
});
export { report_files_safetoshare2 as "report.files.safeToShare" }