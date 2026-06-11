/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Type_Timeout_DescriptionInputs */

const en_step4_type_timeout_description = /** @type {(inputs: Step4_Type_Timeout_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Processing exceeded the time limit.`)
};

const cs_step4_type_timeout_description = /** @type {(inputs: Step4_Type_Timeout_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zpracování překročilo časový limit.`)
};

/**
* | output |
* | --- |
* | "Processing exceeded the time limit." |
*
* @param {Step4_Type_Timeout_DescriptionInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_type_timeout_description = /** @type {((inputs?: Step4_Type_Timeout_DescriptionInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Type_Timeout_DescriptionInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_type_timeout_description(inputs)
	return cs_step4_type_timeout_description(inputs)
});
export { step4_type_timeout_description as "step4.type.timeout.description" }