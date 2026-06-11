/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_Downloaderror1Inputs */

const en_common_downloaderror1 = /** @type {(inputs: Common_Downloaderror1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Download failed. Please try again.`)
};

const cs_common_downloaderror1 = /** @type {(inputs: Common_Downloaderror1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stažení selhalo. Zkuste to prosím znovu.`)
};

/**
* | output |
* | --- |
* | "Download failed. Please try again." |
*
* @param {Common_Downloaderror1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_downloaderror1 = /** @type {((inputs?: Common_Downloaderror1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Downloaderror1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_common_downloaderror1(inputs)
	return cs_common_downloaderror1(inputs)
});
export { common_downloaderror1 as "common.downloadError" }