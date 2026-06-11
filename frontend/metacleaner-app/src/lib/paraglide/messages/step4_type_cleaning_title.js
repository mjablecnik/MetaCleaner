/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Type_Cleaning_TitleInputs */

const en_step4_type_cleaning_title = /** @type {(inputs: Step4_Type_Cleaning_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cleaning error`)
};

const cs_step4_type_cleaning_title = /** @type {(inputs: Step4_Type_Cleaning_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Chyba čištění`)
};

/**
* | output |
* | --- |
* | "Cleaning error" |
*
* @param {Step4_Type_Cleaning_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_type_cleaning_title = /** @type {((inputs?: Step4_Type_Cleaning_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Type_Cleaning_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_type_cleaning_title(inputs)
	return cs_step4_type_cleaning_title(inputs)
});
export { step4_type_cleaning_title as "step4.type.cleaning.title" }