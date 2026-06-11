/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Stats_Gpsremovedshort2Inputs */

const en_reports_stats_gpsremovedshort2 = /** @type {(inputs: Reports_Stats_Gpsremovedshort2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GPS removed`)
};

const cs_reports_stats_gpsremovedshort2 = /** @type {(inputs: Reports_Stats_Gpsremovedshort2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GPS odstraněno`)
};

/**
* | output |
* | --- |
* | "GPS removed" |
*
* @param {Reports_Stats_Gpsremovedshort2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_stats_gpsremovedshort2 = /** @type {((inputs?: Reports_Stats_Gpsremovedshort2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Stats_Gpsremovedshort2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_stats_gpsremovedshort2(inputs)
	return cs_reports_stats_gpsremovedshort2(inputs)
});
export { reports_stats_gpsremovedshort2 as "reports.stats.gpsRemovedShort" }