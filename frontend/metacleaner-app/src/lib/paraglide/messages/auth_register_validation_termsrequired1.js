/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Validation_Termsrequired1Inputs */

const en_auth_register_validation_termsrequired1 = /** @type {(inputs: Auth_Register_Validation_Termsrequired1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You must agree to the terms.`)
};

const cs_auth_register_validation_termsrequired1 = /** @type {(inputs: Auth_Register_Validation_Termsrequired1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Musíte souhlasit s podmínkami.`)
};

/**
* | output |
* | --- |
* | "You must agree to the terms." |
*
* @param {Auth_Register_Validation_Termsrequired1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_validation_termsrequired1 = /** @type {((inputs?: Auth_Register_Validation_Termsrequired1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Validation_Termsrequired1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_validation_termsrequired1(inputs)
	return cs_auth_register_validation_termsrequired1(inputs)
});
export { auth_register_validation_termsrequired1 as "auth.register.validation.termsRequired" }