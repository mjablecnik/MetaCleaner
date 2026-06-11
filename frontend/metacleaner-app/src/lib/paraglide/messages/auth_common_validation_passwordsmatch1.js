/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Validation_Passwordsmatch1Inputs */

const en_auth_common_validation_passwordsmatch1 = /** @type {(inputs: Auth_Common_Validation_Passwordsmatch1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Passwords match.`)
};

const cs_auth_common_validation_passwordsmatch1 = /** @type {(inputs: Auth_Common_Validation_Passwordsmatch1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hesla se shodují.`)
};

/**
* | output |
* | --- |
* | "Passwords match." |
*
* @param {Auth_Common_Validation_Passwordsmatch1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_validation_passwordsmatch1 = /** @type {((inputs?: Auth_Common_Validation_Passwordsmatch1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Validation_Passwordsmatch1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_validation_passwordsmatch1(inputs)
	return cs_auth_common_validation_passwordsmatch1(inputs)
});
export { auth_common_validation_passwordsmatch1 as "auth.common.validation.passwordsMatch" }