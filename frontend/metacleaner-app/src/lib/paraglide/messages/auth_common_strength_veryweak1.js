/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Strength_Veryweak1Inputs */

const en_auth_common_strength_veryweak1 = /** @type {(inputs: Auth_Common_Strength_Veryweak1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Very weak`)
};

const cs_auth_common_strength_veryweak1 = /** @type {(inputs: Auth_Common_Strength_Veryweak1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Velmi slabé`)
};

/**
* | output |
* | --- |
* | "Very weak" |
*
* @param {Auth_Common_Strength_Veryweak1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_veryweak1 = /** @type {((inputs?: Auth_Common_Strength_Veryweak1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_Veryweak1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_strength_veryweak1(inputs)
	return cs_auth_common_strength_veryweak1(inputs)
});
export { auth_common_strength_veryweak1 as "auth.common.strength.veryWeak" }