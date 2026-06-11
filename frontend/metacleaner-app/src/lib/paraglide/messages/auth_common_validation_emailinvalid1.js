/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Validation_Emailinvalid1Inputs */

const en_auth_common_validation_emailinvalid1 = /** @type {(inputs: Auth_Common_Validation_Emailinvalid1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Please enter a valid email address.`)
};

const cs_auth_common_validation_emailinvalid1 = /** @type {(inputs: Auth_Common_Validation_Emailinvalid1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zadejte platnou e-mailovou adresu.`)
};

/**
* | output |
* | --- |
* | "Please enter a valid email address." |
*
* @param {Auth_Common_Validation_Emailinvalid1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_validation_emailinvalid1 = /** @type {((inputs?: Auth_Common_Validation_Emailinvalid1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Validation_Emailinvalid1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_validation_emailinvalid1(inputs)
	return cs_auth_common_validation_emailinvalid1(inputs)
});
export { auth_common_validation_emailinvalid1 as "auth.common.validation.emailInvalid" }