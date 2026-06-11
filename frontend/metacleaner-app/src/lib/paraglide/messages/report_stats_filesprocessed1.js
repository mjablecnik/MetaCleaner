/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Stats_Filesprocessed1Inputs */

const en_report_stats_filesprocessed1 = /** @type {(inputs: Report_Stats_Filesprocessed1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Files processed`)
};

const cs_report_stats_filesprocessed1 = /** @type {(inputs: Report_Stats_Filesprocessed1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Souborů zpracováno`)
};

/**
* | output |
* | --- |
* | "Files processed" |
*
* @param {Report_Stats_Filesprocessed1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_stats_filesprocessed1 = /** @type {((inputs?: Report_Stats_Filesprocessed1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Stats_Filesprocessed1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_stats_filesprocessed1(inputs)
	return cs_report_stats_filesprocessed1(inputs)
});
export { report_stats_filesprocessed1 as "report.stats.filesProcessed" }