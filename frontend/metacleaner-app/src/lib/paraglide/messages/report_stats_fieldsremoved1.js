/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Stats_Fieldsremoved1Inputs */

const en_report_stats_fieldsremoved1 = /** @type {(inputs: Report_Stats_Fieldsremoved1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Metadata fields removed`)
};

const cs_report_stats_fieldsremoved1 = /** @type {(inputs: Report_Stats_Fieldsremoved1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Polí metadat odstraněno`)
};

/**
* | output |
* | --- |
* | "Metadata fields removed" |
*
* @param {Report_Stats_Fieldsremoved1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_stats_fieldsremoved1 = /** @type {((inputs?: Report_Stats_Fieldsremoved1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Stats_Fieldsremoved1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_stats_fieldsremoved1(inputs)
	return cs_report_stats_fieldsremoved1(inputs)
});
export { report_stats_fieldsremoved1 as "report.stats.fieldsRemoved" }