/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Error_Processingfailed1Inputs */

const en_step4_error_processingfailed1 = /** @type {(inputs: Step4_Error_Processingfailed1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Processing failed`)
};

const cs_step4_error_processingfailed1 = /** @type {(inputs: Step4_Error_Processingfailed1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zpracování selhalo`)
};

/**
* | output |
* | --- |
* | "Processing failed" |
*
* @param {Step4_Error_Processingfailed1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_error_processingfailed1 = /** @type {((inputs?: Step4_Error_Processingfailed1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Error_Processingfailed1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_error_processingfailed1(inputs)
	return cs_step4_error_processingfailed1(inputs)
});
export { step4_error_processingfailed1 as "step4.error.processingFailed" }