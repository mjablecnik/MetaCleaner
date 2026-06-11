/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Stats_Fieldsremoved1Inputs */

const en_step5_stats_fieldsremoved1 = /** @type {(inputs: Step5_Stats_Fieldsremoved1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Metadata fields removed`)
};

const cs_step5_stats_fieldsremoved1 = /** @type {(inputs: Step5_Stats_Fieldsremoved1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Polí metadat odstraněno`)
};

/**
* | output |
* | --- |
* | "Metadata fields removed" |
*
* @param {Step5_Stats_Fieldsremoved1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_stats_fieldsremoved1 = /** @type {((inputs?: Step5_Stats_Fieldsremoved1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Stats_Fieldsremoved1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_stats_fieldsremoved1(inputs)
	return cs_step5_stats_fieldsremoved1(inputs)
});
export { step5_stats_fieldsremoved1 as "step5.stats.fieldsRemoved" }