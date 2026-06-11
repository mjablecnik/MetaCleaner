/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Strength_ExcellentInputs */

const en_auth_common_strength_excellent = /** @type {(inputs: Auth_Common_Strength_ExcellentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Excellent!`)
};

const cs_auth_common_strength_excellent = /** @type {(inputs: Auth_Common_Strength_ExcellentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Výborně!`)
};

/**
* | output |
* | --- |
* | "Excellent!" |
*
* @param {Auth_Common_Strength_ExcellentInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_excellent = /** @type {((inputs?: Auth_Common_Strength_ExcellentInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_ExcellentInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_strength_excellent(inputs)
	return cs_auth_common_strength_excellent(inputs)
});
export { auth_common_strength_excellent as "auth.common.strength.excellent" }