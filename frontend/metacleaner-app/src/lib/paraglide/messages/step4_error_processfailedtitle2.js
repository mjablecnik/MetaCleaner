/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Error_Processfailedtitle2Inputs */

const en_step4_error_processfailedtitle2 = /** @type {(inputs: Step4_Error_Processfailedtitle2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cleaning process failed`)
};

const cs_step4_error_processfailedtitle2 = /** @type {(inputs: Step4_Error_Processfailedtitle2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Proces čištění selhal`)
};

/**
* | output |
* | --- |
* | "Cleaning process failed" |
*
* @param {Step4_Error_Processfailedtitle2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_error_processfailedtitle2 = /** @type {((inputs?: Step4_Error_Processfailedtitle2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Error_Processfailedtitle2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_error_processfailedtitle2(inputs)
	return cs_step4_error_processfailedtitle2(inputs)
});
export { step4_error_processfailedtitle2 as "step4.error.processFailedTitle" }