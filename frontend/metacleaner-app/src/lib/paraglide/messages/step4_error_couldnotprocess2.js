/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Error_Couldnotprocess2Inputs */

const en_step4_error_couldnotprocess2 = /** @type {(inputs: Step4_Error_Couldnotprocess2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`could not be processed`)
};

const cs_step4_error_couldnotprocess2 = /** @type {(inputs: Step4_Error_Couldnotprocess2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`nebylo možné zpracovat`)
};

/**
* | output |
* | --- |
* | "could not be processed" |
*
* @param {Step4_Error_Couldnotprocess2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_error_couldnotprocess2 = /** @type {((inputs?: Step4_Error_Couldnotprocess2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Error_Couldnotprocess2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_error_couldnotprocess2(inputs)
	return cs_step4_error_couldnotprocess2(inputs)
});
export { step4_error_couldnotprocess2 as "step4.error.couldNotProcess" }