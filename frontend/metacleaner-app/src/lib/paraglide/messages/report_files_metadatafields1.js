/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Files_Metadatafields1Inputs */

const en_report_files_metadatafields1 = /** @type {(inputs: Report_Files_Metadatafields1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`metadata fields`)
};

const cs_report_files_metadatafields1 = /** @type {(inputs: Report_Files_Metadatafields1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`polí metadat`)
};

/**
* | output |
* | --- |
* | "metadata fields" |
*
* @param {Report_Files_Metadatafields1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_files_metadatafields1 = /** @type {((inputs?: Report_Files_Metadatafields1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Files_Metadatafields1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_files_metadatafields1(inputs)
	return cs_report_files_metadatafields1(inputs)
});
export { report_files_metadatafields1 as "report.files.metadataFields" }