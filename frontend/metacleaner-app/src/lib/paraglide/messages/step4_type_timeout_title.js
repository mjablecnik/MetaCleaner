/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Type_Timeout_TitleInputs */

const en_step4_type_timeout_title = /** @type {(inputs: Step4_Type_Timeout_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Timeout`)
};

const cs_step4_type_timeout_title = /** @type {(inputs: Step4_Type_Timeout_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Časový limit`)
};

/**
* | output |
* | --- |
* | "Timeout" |
*
* @param {Step4_Type_Timeout_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_type_timeout_title = /** @type {((inputs?: Step4_Type_Timeout_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Type_Timeout_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_type_timeout_title(inputs)
	return cs_step4_type_timeout_title(inputs)
});
export { step4_type_timeout_title as "step4.type.timeout.title" }