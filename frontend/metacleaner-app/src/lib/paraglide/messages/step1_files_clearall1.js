/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step1_Files_Clearall1Inputs */

const en_step1_files_clearall1 = /** @type {(inputs: Step1_Files_Clearall1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clear all`)
};

const cs_step1_files_clearall1 = /** @type {(inputs: Step1_Files_Clearall1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vymazat vše`)
};

/**
* | output |
* | --- |
* | "Clear all" |
*
* @param {Step1_Files_Clearall1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_files_clearall1 = /** @type {((inputs?: Step1_Files_Clearall1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Files_Clearall1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step1_files_clearall1(inputs)
	return cs_step1_files_clearall1(inputs)
});
export { step1_files_clearall1 as "step1.files.clearAll" }