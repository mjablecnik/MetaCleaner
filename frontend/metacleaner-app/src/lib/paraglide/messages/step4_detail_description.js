/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Detail_DescriptionInputs */

const en_step4_detail_description = /** @type {(inputs: Step4_Detail_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cleaning process interrupted due to internal error. Please check the error details and try again.`)
};

const cs_step4_detail_description = /** @type {(inputs: Step4_Detail_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Proces čištění metadat byl přerušen z důvodu interní chyby. Ověřte detaily chyby a zkuste akci opakovat.`)
};

/**
* | output |
* | --- |
* | "Cleaning process interrupted due to internal error. Please check the error details and try again." |
*
* @param {Step4_Detail_DescriptionInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_detail_description = /** @type {((inputs?: Step4_Detail_DescriptionInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Detail_DescriptionInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_detail_description(inputs)
	return cs_step4_detail_description(inputs)
});
export { step4_detail_description as "step4.detail.description" }