/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_Goback1Inputs */

const en_common_goback1 = /** @type {(inputs: Common_Goback1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Go back`)
};

const cs_common_goback1 = /** @type {(inputs: Common_Goback1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zpět`)
};

/**
* | output |
* | --- |
* | "Go back" |
*
* @param {Common_Goback1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_goback1 = /** @type {((inputs?: Common_Goback1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Goback1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_common_goback1(inputs)
	return cs_common_goback1(inputs)
});
export { common_goback1 as "common.goBack" }