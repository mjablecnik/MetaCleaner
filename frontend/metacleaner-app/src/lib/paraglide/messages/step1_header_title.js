/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step1_Header_TitleInputs */

const en_step1_header_title = /** @type {(inputs: Step1_Header_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Metadata Cleaning`)
};

const cs_step1_header_title = /** @type {(inputs: Step1_Header_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Čištění metadat`)
};

/**
* | output |
* | --- |
* | "Metadata Cleaning" |
*
* @param {Step1_Header_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_header_title = /** @type {((inputs?: Step1_Header_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Header_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step1_header_title(inputs)
	return cs_step1_header_title(inputs)
});
export { step1_header_title as "step1.header.title" }