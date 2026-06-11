/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Files_RemovedInputs */

const en_report_files_removed = /** @type {(inputs: Report_Files_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`removed`)
};

const cs_report_files_removed = /** @type {(inputs: Report_Files_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`odstraněno`)
};

/**
* | output |
* | --- |
* | "removed" |
*
* @param {Report_Files_RemovedInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_files_removed = /** @type {((inputs?: Report_Files_RemovedInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Files_RemovedInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_files_removed(inputs)
	return cs_report_files_removed(inputs)
});
export { report_files_removed as "report.files.removed" }