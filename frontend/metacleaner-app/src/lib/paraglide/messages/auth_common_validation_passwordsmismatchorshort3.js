/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Validation_Passwordsmismatchorshort3Inputs */

const en_auth_common_validation_passwordsmismatchorshort3 = /** @type {(inputs: Auth_Common_Validation_Passwordsmismatchorshort3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Passwords do not match or are too short.`)
};

const cs_auth_common_validation_passwordsmismatchorshort3 = /** @type {(inputs: Auth_Common_Validation_Passwordsmismatchorshort3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hesla se neshodují nebo jsou příliš krátká.`)
};

/**
* | output |
* | --- |
* | "Passwords do not match or are too short." |
*
* @param {Auth_Common_Validation_Passwordsmismatchorshort3Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_validation_passwordsmismatchorshort3 = /** @type {((inputs?: Auth_Common_Validation_Passwordsmismatchorshort3Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Validation_Passwordsmismatchorshort3Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_validation_passwordsmismatchorshort3(inputs)
	return cs_auth_common_validation_passwordsmismatchorshort3(inputs)
});
export { auth_common_validation_passwordsmismatchorshort3 as "auth.common.validation.passwordsMismatchOrShort" }