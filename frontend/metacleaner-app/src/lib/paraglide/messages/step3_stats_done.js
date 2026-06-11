/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step3_Stats_DoneInputs */

const en_step3_stats_done = /** @type {(inputs: Step3_Stats_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Done`)
};

const cs_step3_stats_done = /** @type {(inputs: Step3_Stats_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hotovo`)
};

/**
* | output |
* | --- |
* | "Done" |
*
* @param {Step3_Stats_DoneInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_stats_done = /** @type {((inputs?: Step3_Stats_DoneInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Stats_DoneInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step3_stats_done(inputs)
	return cs_step3_stats_done(inputs)
});
export { step3_stats_done as "step3.stats.done" }