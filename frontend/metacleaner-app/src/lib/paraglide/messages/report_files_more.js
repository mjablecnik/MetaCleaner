/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Files_MoreInputs */

const en_report_files_more = /** @type {(inputs: Report_Files_MoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`more`)
};

const cs_report_files_more = /** @type {(inputs: Report_Files_MoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`dalších`)
};

/**
* | output |
* | --- |
* | "more" |
*
* @param {Report_Files_MoreInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_files_more = /** @type {((inputs?: Report_Files_MoreInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Files_MoreInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_files_more(inputs)
	return cs_report_files_more(inputs)
});
export { report_files_more as "report.files.more" }