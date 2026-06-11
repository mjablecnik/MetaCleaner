/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Error_InterruptedInputs */

const en_step4_error_interrupted = /** @type {(inputs: Step4_Error_InterruptedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Interrupted`)
};

const cs_step4_error_interrupted = /** @type {(inputs: Step4_Error_InterruptedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Přerušeno`)
};

/**
* | output |
* | --- |
* | "Interrupted" |
*
* @param {Step4_Error_InterruptedInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_error_interrupted = /** @type {((inputs?: Step4_Error_InterruptedInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Error_InterruptedInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_error_interrupted(inputs)
	return cs_step4_error_interrupted(inputs)
});
export { step4_error_interrupted as "step4.error.interrupted" }