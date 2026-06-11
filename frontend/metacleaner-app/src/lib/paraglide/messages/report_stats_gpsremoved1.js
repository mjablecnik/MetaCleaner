/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Stats_Gpsremoved1Inputs */

const en_report_stats_gpsremoved1 = /** @type {(inputs: Report_Stats_Gpsremoved1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GPS locations removed`)
};

const cs_report_stats_gpsremoved1 = /** @type {(inputs: Report_Stats_Gpsremoved1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GPS lokací odstraněno`)
};

/**
* | output |
* | --- |
* | "GPS locations removed" |
*
* @param {Report_Stats_Gpsremoved1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_stats_gpsremoved1 = /** @type {((inputs?: Report_Stats_Gpsremoved1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Stats_Gpsremoved1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_stats_gpsremoved1(inputs)
	return cs_report_stats_gpsremoved1(inputs)
});
export { report_stats_gpsremoved1 as "report.stats.gpsRemoved" }