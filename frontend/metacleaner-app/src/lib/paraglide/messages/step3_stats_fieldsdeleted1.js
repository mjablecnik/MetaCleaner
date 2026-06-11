/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step3_Stats_Fieldsdeleted1Inputs */

const en_step3_stats_fieldsdeleted1 = /** @type {(inputs: Step3_Stats_Fieldsdeleted1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fields deleted`)
};

const cs_step3_stats_fieldsdeleted1 = /** @type {(inputs: Step3_Stats_Fieldsdeleted1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Polí smazáno`)
};

/**
* | output |
* | --- |
* | "Fields deleted" |
*
* @param {Step3_Stats_Fieldsdeleted1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_stats_fieldsdeleted1 = /** @type {((inputs?: Step3_Stats_Fieldsdeleted1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Stats_Fieldsdeleted1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step3_stats_fieldsdeleted1(inputs)
	return cs_step3_stats_fieldsdeleted1(inputs)
});
export { step3_stats_fieldsdeleted1 as "step3.stats.fieldsDeleted" }