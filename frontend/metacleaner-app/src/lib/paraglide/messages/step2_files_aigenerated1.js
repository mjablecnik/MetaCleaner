/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Files_Aigenerated1Inputs */

const en_step2_files_aigenerated1 = /** @type {(inputs: Step2_Files_Aigenerated1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`AI-generated`)
};

const cs_step2_files_aigenerated1 = /** @type {(inputs: Step2_Files_Aigenerated1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generováno AI`)
};

/**
* | output |
* | --- |
* | "AI-generated" |
*
* @param {Step2_Files_Aigenerated1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_files_aigenerated1 = /** @type {((inputs?: Step2_Files_Aigenerated1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Files_Aigenerated1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_files_aigenerated1(inputs)
	return cs_step2_files_aigenerated1(inputs)
});
export { step2_files_aigenerated1 as "step2.files.aiGenerated" }