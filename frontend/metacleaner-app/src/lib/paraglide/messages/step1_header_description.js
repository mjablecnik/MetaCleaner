/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step1_Header_DescriptionInputs */

const en_step1_header_description = /** @type {(inputs: Step1_Header_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Upload files and remove hidden metadata locally on your device.`)
};

const cs_step1_header_description = /** @type {(inputs: Step1_Header_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nahrajte soubory a odstraňte skrytá metadata lokálně na vašem zařízení.`)
};

/**
* | output |
* | --- |
* | "Upload files and remove hidden metadata locally on your device." |
*
* @param {Step1_Header_DescriptionInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_header_description = /** @type {((inputs?: Step1_Header_DescriptionInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Header_DescriptionInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step1_header_description(inputs)
	return cs_step1_header_description(inputs)
});
export { step1_header_description as "step1.header.description" }