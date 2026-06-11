/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Stats_Totaltime1Inputs */

const en_report_stats_totaltime1 = /** @type {(inputs: Report_Stats_Totaltime1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Total cleaning time`)
};

const cs_report_stats_totaltime1 = /** @type {(inputs: Report_Stats_Totaltime1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Celková doba čištění`)
};

/**
* | output |
* | --- |
* | "Total cleaning time" |
*
* @param {Report_Stats_Totaltime1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_stats_totaltime1 = /** @type {((inputs?: Report_Stats_Totaltime1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Stats_Totaltime1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_stats_totaltime1(inputs)
	return cs_report_stats_totaltime1(inputs)
});
export { report_stats_totaltime1 as "report.stats.totalTime" }