/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Type_Cleaning_DescriptionInputs */

const en_step4_type_cleaning_description = /** @type {(inputs: Step4_Type_Cleaning_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Metadata could not be completely removed from one or more files.`)
};

const cs_step4_type_cleaning_description = /** @type {(inputs: Step4_Type_Cleaning_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Metadata nebylo možné zcela odstranit z jednoho nebo více souborů.`)
};

/**
* | output |
* | --- |
* | "Metadata could not be completely removed from one or more files." |
*
* @param {Step4_Type_Cleaning_DescriptionInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_type_cleaning_description = /** @type {((inputs?: Step4_Type_Cleaning_DescriptionInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Type_Cleaning_DescriptionInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_type_cleaning_description(inputs)
	return cs_step4_type_cleaning_description(inputs)
});
export { step4_type_cleaning_description as "step4.type.cleaning.description" }