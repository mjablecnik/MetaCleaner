/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Field_Firstname1Inputs */

const en_auth_register_field_firstname1 = /** @type {(inputs: Auth_Register_Field_Firstname1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`First name`)
};

const cs_auth_register_field_firstname1 = /** @type {(inputs: Auth_Register_Field_Firstname1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Jméno`)
};

/**
* | output |
* | --- |
* | "First name" |
*
* @param {Auth_Register_Field_Firstname1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_field_firstname1 = /** @type {((inputs?: Auth_Register_Field_Firstname1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Field_Firstname1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_field_firstname1(inputs)
	return cs_auth_register_field_firstname1(inputs)
});
export { auth_register_field_firstname1 as "auth.register.field.firstName" }