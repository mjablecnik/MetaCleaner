/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Validation_Otpincomplete1Inputs */

const en_auth_common_validation_otpincomplete1 = /** @type {(inputs: Auth_Common_Validation_Otpincomplete1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Please enter the complete 6-digit code.`)
};

const cs_auth_common_validation_otpincomplete1 = /** @type {(inputs: Auth_Common_Validation_Otpincomplete1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zadejte celý 6místný kód.`)
};

/**
* | output |
* | --- |
* | "Please enter the complete 6-digit code." |
*
* @param {Auth_Common_Validation_Otpincomplete1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_validation_otpincomplete1 = /** @type {((inputs?: Auth_Common_Validation_Otpincomplete1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Validation_Otpincomplete1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_validation_otpincomplete1(inputs)
	return cs_auth_common_validation_otpincomplete1(inputs)
});
export { auth_common_validation_otpincomplete1 as "auth.common.validation.otpIncomplete" }