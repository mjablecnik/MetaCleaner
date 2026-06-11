/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_Brandname1Inputs */

const en_common_brandname1 = /** @type {(inputs: Common_Brandname1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MetaCleaner`)
};

const cs_common_brandname1 = /** @type {(inputs: Common_Brandname1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MetaCleaner`)
};

/**
* | output |
* | --- |
* | "MetaCleaner" |
*
* @param {Common_Brandname1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_brandname1 = /** @type {((inputs?: Common_Brandname1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Brandname1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_common_brandname1(inputs)
	return cs_common_brandname1(inputs)
});
export { common_brandname1 as "common.brandName" }