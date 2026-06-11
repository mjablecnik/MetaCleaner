/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_Closemenu1Inputs */

const en_common_closemenu1 = /** @type {(inputs: Common_Closemenu1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Close menu`)
};

const cs_common_closemenu1 = /** @type {(inputs: Common_Closemenu1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zavřít menu`)
};

/**
* | output |
* | --- |
* | "Close menu" |
*
* @param {Common_Closemenu1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_closemenu1 = /** @type {((inputs?: Common_Closemenu1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Closemenu1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_common_closemenu1(inputs)
	return cs_common_closemenu1(inputs)
});
export { common_closemenu1 as "common.closeMenu" }