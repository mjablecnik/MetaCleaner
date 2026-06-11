/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Stats_Totalreports1Inputs */

const en_reports_stats_totalreports1 = /** @type {(inputs: Reports_Stats_Totalreports1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Total reports`)
};

const cs_reports_stats_totalreports1 = /** @type {(inputs: Reports_Stats_Totalreports1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Celkem reportů`)
};

/**
* | output |
* | --- |
* | "Total reports" |
*
* @param {Reports_Stats_Totalreports1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_stats_totalreports1 = /** @type {((inputs?: Reports_Stats_Totalreports1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Stats_Totalreports1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_stats_totalreports1(inputs)
	return cs_reports_stats_totalreports1(inputs)
});
export { reports_stats_totalreports1 as "reports.stats.totalReports" }