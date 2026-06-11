/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_Removefile1Inputs */

const en_common_removefile1 = /** @type {(inputs: Common_Removefile1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remove file`)
};

const cs_common_removefile1 = /** @type {(inputs: Common_Removefile1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Odebrat soubor`)
};

/**
* | output |
* | --- |
* | "Remove file" |
*
* @param {Common_Removefile1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_removefile1 = /** @type {((inputs?: Common_Removefile1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Removefile1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_common_removefile1(inputs)
	return cs_common_removefile1(inputs)
});
export { common_removefile1 as "common.removeFile" }