/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Validation_Lastnamerequired2Inputs */

const en_auth_register_validation_lastnamerequired2 = /** @type {(inputs: Auth_Register_Validation_Lastnamerequired2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Please enter your last name.`)
};

const cs_auth_register_validation_lastnamerequired2 = /** @type {(inputs: Auth_Register_Validation_Lastnamerequired2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vyplňte příjmení.`)
};

/**
* | output |
* | --- |
* | "Please enter your last name." |
*
* @param {Auth_Register_Validation_Lastnamerequired2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_validation_lastnamerequired2 = /** @type {((inputs?: Auth_Register_Validation_Lastnamerequired2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Validation_Lastnamerequired2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_validation_lastnamerequired2(inputs)
	return cs_auth_register_validation_lastnamerequired2(inputs)
});
export { auth_register_validation_lastnamerequired2 as "auth.register.validation.lastNameRequired" }