/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Error_Failedshort1Inputs */

const en_step4_error_failedshort1 = /** @type {(inputs: Step4_Error_Failedshort1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Failed`)
};

const cs_step4_error_failedshort1 = /** @type {(inputs: Step4_Error_Failedshort1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Selhalo`)
};

/**
* | output |
* | --- |
* | "Failed" |
*
* @param {Step4_Error_Failedshort1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_error_failedshort1 = /** @type {((inputs?: Step4_Error_Failedshort1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Error_Failedshort1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_error_failedshort1(inputs)
	return cs_step4_error_failedshort1(inputs)
});
export { step4_error_failedshort1 as "step4.error.failedShort" }