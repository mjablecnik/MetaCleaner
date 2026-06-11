/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Error_SkippedInputs */

const en_step4_error_skipped = /** @type {(inputs: Step4_Error_SkippedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Skipped`)
};

const cs_step4_error_skipped = /** @type {(inputs: Step4_Error_SkippedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Přeskočeno`)
};

/**
* | output |
* | --- |
* | "Skipped" |
*
* @param {Step4_Error_SkippedInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_error_skipped = /** @type {((inputs?: Step4_Error_SkippedInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Error_SkippedInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_error_skipped(inputs)
	return cs_step4_error_skipped(inputs)
});
export { step4_error_skipped as "step4.error.skipped" }