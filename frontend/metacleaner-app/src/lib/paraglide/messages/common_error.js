/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_ErrorInputs */

const en_common_error = /** @type {(inputs: Common_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An error occurred. Please try again.`)
};

const cs_common_error = /** @type {(inputs: Common_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Došlo k chybě. Zkuste to prosím znovu.`)
};

/**
* | output |
* | --- |
* | "An error occurred. Please try again." |
*
* @param {Common_ErrorInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_error = /** @type {((inputs?: Common_ErrorInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_ErrorInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_common_error(inputs)
	return cs_common_error(inputs)
});
export { common_error as "common.error" }