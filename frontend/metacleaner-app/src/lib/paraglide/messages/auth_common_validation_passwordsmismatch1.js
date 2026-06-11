/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Validation_Passwordsmismatch1Inputs */

const en_auth_common_validation_passwordsmismatch1 = /** @type {(inputs: Auth_Common_Validation_Passwordsmismatch1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Passwords do not match.`)
};

const cs_auth_common_validation_passwordsmismatch1 = /** @type {(inputs: Auth_Common_Validation_Passwordsmismatch1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hesla se neshodují.`)
};

/**
* | output |
* | --- |
* | "Passwords do not match." |
*
* @param {Auth_Common_Validation_Passwordsmismatch1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_validation_passwordsmismatch1 = /** @type {((inputs?: Auth_Common_Validation_Passwordsmismatch1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Validation_Passwordsmismatch1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_validation_passwordsmismatch1(inputs)
	return cs_auth_common_validation_passwordsmismatch1(inputs)
});
export { auth_common_validation_passwordsmismatch1 as "auth.common.validation.passwordsMismatch" }