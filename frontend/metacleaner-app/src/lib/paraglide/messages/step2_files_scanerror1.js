/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Files_Scanerror1Inputs */

const en_step2_files_scanerror1 = /** @type {(inputs: Step2_Files_Scanerror1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not scan`)
};

const cs_step2_files_scanerror1 = /** @type {(inputs: Step2_Files_Scanerror1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nelze naskenovat`)
};

/**
* | output |
* | --- |
* | "Could not scan" |
*
* @param {Step2_Files_Scanerror1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_files_scanerror1 = /** @type {((inputs?: Step2_Files_Scanerror1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Files_Scanerror1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_files_scanerror1(inputs)
	return cs_step2_files_scanerror1(inputs)
});
export { step2_files_scanerror1 as "step2.files.scanError" }