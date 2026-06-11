/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Stats_Totaltime1Inputs */

const en_step5_stats_totaltime1 = /** @type {(inputs: Step5_Stats_Totaltime1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Total cleaning time`)
};

const cs_step5_stats_totaltime1 = /** @type {(inputs: Step5_Stats_Totaltime1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Celková doba čištění`)
};

/**
* | output |
* | --- |
* | "Total cleaning time" |
*
* @param {Step5_Stats_Totaltime1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_stats_totaltime1 = /** @type {((inputs?: Step5_Stats_Totaltime1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Stats_Totaltime1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_stats_totaltime1(inputs)
	return cs_step5_stats_totaltime1(inputs)
});
export { step5_stats_totaltime1 as "step5.stats.totalTime" }