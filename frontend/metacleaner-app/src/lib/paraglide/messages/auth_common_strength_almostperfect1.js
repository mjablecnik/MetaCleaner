/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Strength_Almostperfect1Inputs */

const en_auth_common_strength_almostperfect1 = /** @type {(inputs: Auth_Common_Strength_Almostperfect1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Almost perfect!`)
};

const cs_auth_common_strength_almostperfect1 = /** @type {(inputs: Auth_Common_Strength_Almostperfect1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Skoro perfektní!`)
};

/**
* | output |
* | --- |
* | "Almost perfect!" |
*
* @param {Auth_Common_Strength_Almostperfect1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_almostperfect1 = /** @type {((inputs?: Auth_Common_Strength_Almostperfect1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_Almostperfect1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_strength_almostperfect1(inputs)
	return cs_auth_common_strength_almostperfect1(inputs)
});
export { auth_common_strength_almostperfect1 as "auth.common.strength.almostPerfect" }