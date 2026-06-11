/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Strength_Verystrongpassword2Inputs */

const en_auth_common_strength_verystrongpassword2 = /** @type {(inputs: Auth_Common_Strength_Verystrongpassword2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Very strong password`)
};

const cs_auth_common_strength_verystrongpassword2 = /** @type {(inputs: Auth_Common_Strength_Verystrongpassword2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Velmi silné heslo`)
};

/**
* | output |
* | --- |
* | "Very strong password" |
*
* @param {Auth_Common_Strength_Verystrongpassword2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_verystrongpassword2 = /** @type {((inputs?: Auth_Common_Strength_Verystrongpassword2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_Verystrongpassword2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_strength_verystrongpassword2(inputs)
	return cs_auth_common_strength_verystrongpassword2(inputs)
});
export { auth_common_strength_verystrongpassword2 as "auth.common.strength.veryStrongPassword" }