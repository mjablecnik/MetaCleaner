/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_Openmenu1Inputs */

const en_common_openmenu1 = /** @type {(inputs: Common_Openmenu1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open menu`)
};

const cs_common_openmenu1 = /** @type {(inputs: Common_Openmenu1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Otevřít menu`)
};

/**
* | output |
* | --- |
* | "Open menu" |
*
* @param {Common_Openmenu1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_openmenu1 = /** @type {((inputs?: Common_Openmenu1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Openmenu1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_common_openmenu1(inputs)
	return cs_common_openmenu1(inputs)
});
export { common_openmenu1 as "common.openMenu" }