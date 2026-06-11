/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Files_Addmore1Inputs */

const en_step2_files_addmore1 = /** @type {(inputs: Step2_Files_Addmore1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add more files`)
};

const cs_step2_files_addmore1 = /** @type {(inputs: Step2_Files_Addmore1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Přidat další soubory`)
};

/**
* | output |
* | --- |
* | "Add more files" |
*
* @param {Step2_Files_Addmore1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_files_addmore1 = /** @type {((inputs?: Step2_Files_Addmore1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Files_Addmore1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_files_addmore1(inputs)
	return cs_step2_files_addmore1(inputs)
});
export { step2_files_addmore1 as "step2.files.addMore" }