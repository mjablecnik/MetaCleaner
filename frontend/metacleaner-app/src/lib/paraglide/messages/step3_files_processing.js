/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step3_Files_ProcessingInputs */

const en_step3_files_processing = /** @type {(inputs: Step3_Files_ProcessingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Processing...`)
};

const cs_step3_files_processing = /** @type {(inputs: Step3_Files_ProcessingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zpracovávám...`)
};

/**
* | output |
* | --- |
* | "Processing..." |
*
* @param {Step3_Files_ProcessingInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_files_processing = /** @type {((inputs?: Step3_Files_ProcessingInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Files_ProcessingInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step3_files_processing(inputs)
	return cs_step3_files_processing(inputs)
});
export { step3_files_processing as "step3.files.processing" }