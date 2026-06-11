/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Field_Firstnameplaceholder2Inputs */

const en_auth_register_field_firstnameplaceholder2 = /** @type {(inputs: Auth_Register_Field_Firstnameplaceholder2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`John`)
};

const cs_auth_register_field_firstnameplaceholder2 = /** @type {(inputs: Auth_Register_Field_Firstnameplaceholder2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Jan`)
};

/**
* | output |
* | --- |
* | "John" |
*
* @param {Auth_Register_Field_Firstnameplaceholder2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_field_firstnameplaceholder2 = /** @type {((inputs?: Auth_Register_Field_Firstnameplaceholder2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Field_Firstnameplaceholder2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_field_firstnameplaceholder2(inputs)
	return cs_auth_register_field_firstnameplaceholder2(inputs)
});
export { auth_register_field_firstnameplaceholder2 as "auth.register.field.firstNamePlaceholder" }