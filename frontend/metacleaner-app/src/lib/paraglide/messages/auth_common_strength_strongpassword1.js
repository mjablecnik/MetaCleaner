/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Strength_Strongpassword1Inputs */

const en_auth_common_strength_strongpassword1 = /** @type {(inputs: Auth_Common_Strength_Strongpassword1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Strong password`)
};

const cs_auth_common_strength_strongpassword1 = /** @type {(inputs: Auth_Common_Strength_Strongpassword1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Silné heslo`)
};

/**
* | output |
* | --- |
* | "Strong password" |
*
* @param {Auth_Common_Strength_Strongpassword1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_strongpassword1 = /** @type {((inputs?: Auth_Common_Strength_Strongpassword1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_Strongpassword1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_strength_strongpassword1(inputs)
	return cs_auth_common_strength_strongpassword1(inputs)
});
export { auth_common_strength_strongpassword1 as "auth.common.strength.strongPassword" }