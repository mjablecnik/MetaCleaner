/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Type_TitleInputs */

const en_step4_type_title = /** @type {(inputs: Step4_Type_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Error type`)
};

const cs_step4_type_title = /** @type {(inputs: Step4_Type_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Typ chyby`)
};

/**
* | output |
* | --- |
* | "Error type" |
*
* @param {Step4_Type_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_type_title = /** @type {((inputs?: Step4_Type_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Type_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_type_title(inputs)
	return cs_step4_type_title(inputs)
});
export { step4_type_title as "step4.type.title" }