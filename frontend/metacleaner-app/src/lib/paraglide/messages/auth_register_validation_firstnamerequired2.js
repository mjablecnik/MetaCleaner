/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Validation_Firstnamerequired2Inputs */

const en_auth_register_validation_firstnamerequired2 = /** @type {(inputs: Auth_Register_Validation_Firstnamerequired2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Please enter your first name.`)
};

const cs_auth_register_validation_firstnamerequired2 = /** @type {(inputs: Auth_Register_Validation_Firstnamerequired2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vyplňte jméno.`)
};

/**
* | output |
* | --- |
* | "Please enter your first name." |
*
* @param {Auth_Register_Validation_Firstnamerequired2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_validation_firstnamerequired2 = /** @type {((inputs?: Auth_Register_Validation_Firstnamerequired2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Validation_Firstnamerequired2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_validation_firstnamerequired2(inputs)
	return cs_auth_register_validation_firstnamerequired2(inputs)
});
export { auth_register_validation_firstnamerequired2 as "auth.register.validation.firstNameRequired" }