/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Stats_Filesprocessed1Inputs */

const en_step5_stats_filesprocessed1 = /** @type {(inputs: Step5_Stats_Filesprocessed1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Files processed`)
};

const cs_step5_stats_filesprocessed1 = /** @type {(inputs: Step5_Stats_Filesprocessed1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Souborů zpracováno`)
};

/**
* | output |
* | --- |
* | "Files processed" |
*
* @param {Step5_Stats_Filesprocessed1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_stats_filesprocessed1 = /** @type {((inputs?: Step5_Stats_Filesprocessed1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Stats_Filesprocessed1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_stats_filesprocessed1(inputs)
	return cs_step5_stats_filesprocessed1(inputs)
});
export { step5_stats_filesprocessed1 as "step5.stats.filesProcessed" }