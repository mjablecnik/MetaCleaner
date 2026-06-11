/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Stats_Gpsremoved1Inputs */

const en_reports_stats_gpsremoved1 = /** @type {(inputs: Reports_Stats_Gpsremoved1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GPS locations removed`)
};

const cs_reports_stats_gpsremoved1 = /** @type {(inputs: Reports_Stats_Gpsremoved1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GPS lokací odstraněno`)
};

/**
* | output |
* | --- |
* | "GPS locations removed" |
*
* @param {Reports_Stats_Gpsremoved1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_stats_gpsremoved1 = /** @type {((inputs?: Reports_Stats_Gpsremoved1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Stats_Gpsremoved1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_stats_gpsremoved1(inputs)
	return cs_reports_stats_gpsremoved1(inputs)
});
export { reports_stats_gpsremoved1 as "reports.stats.gpsRemoved" }